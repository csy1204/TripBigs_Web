from typing import List, Optional
from enum import Enum

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

import logging
import warnings
warnings.filterwarnings('ignore')

app = FastAPI()
app.mount("/", StaticFiles(directory="../build"), name="build")


import gc
import glob
import os

import numpy as np
import pandas as pd

import sys
sys.path.append('/Users/josang-yeon/2020/tobigs/tobigs_reco_conf/recsys2019/src')

from recsys.data_generator.accumulators import get_accumulators, logger, group_accumulators

from recsys.transformers import (
    FeatureEng,
    FeaturesAtAbsoluteRank,
    LagNumericalFeaturesWithinGroup,
    MinimizeNNZ,
    PandasToNpArray,
    PandasToRecords,
    RankFeatures,
    SparsityFilter,
)

from recsys.utils import logger

from scipy.sparse import load_npz, save_npz
from sklearn.compose import ColumnTransformer
from sklearn.feature_extraction import DictVectorizer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import make_pipeline

import json
from collections import defaultdict
import arrow

import pickle
import joblib

model = joblib.load("model_val.joblib")

with open("total_feature_col.pkl", "rb") as f:
    tot_features = pickle.load(f)

def get_same_features(org_features, tot_features):
    return  [
        feat
        for feat in org_features
        if feat in tot_features
    ]

def get_not_in_total_features(org_features, tot_features):
    return  [
        feat
        for feat in tot_features
        if feat not in org_features
    ]

def get_event_sorted(events):
    events["src"] = "train"
    events["is_test"] = 0
    
    events.sort_values(["timestamp", "user_id", "step"], inplace=True)
    events["fake_impressions"] = events.groupby(["user_id", "session_id"])["impressions"].bfill()
    events["fake_prices"] = events.groupby(["user_id", "session_id"])["prices"].bfill()

    events["clickout_step_rev"] = (
        events.groupby(["action_type", "session_id"])["step"].rank("max", ascending=False).astype(np.int)
    )
    events["clickout_step"] = (
        events.groupby(["action_type", "session_id"])["step"].rank("max", ascending=True).astype(np.int)
    )
    events["clickout_max_step"] = events["clickout_step"] + events["clickout_step_rev"] - 1
    events["dt"] = events["timestamp"].map(lambda x: str(arrow.get(x).date()))
    events["is_val"] = 0
    events["is_val"] = events["is_val"].astype(np.int)
    return events.reset_index(drop=True)
    # events.to_csv("../../../data/events_sorted.csv", index=False)


## 2. Generater

class FeatureGenerator:
    def __init__(self, limit, accumulators, save_only_features=False, input_df=None):
        self.limit = limit
        self.accumulators = accumulators
        self.accs_by_action_type = group_accumulators(accumulators)
        self.save_only_features = save_only_features
        self.input = self.preprocess(input_df)
        print("Number of accumulators %d" % len(self.accumulators))


    def preprocess(self, row):
        row["timestamp"] = row["timestamp"].astype(int)
        row["fake_impressions_raw"] = row["fake_impressions"]
        row["fake_impressions"] = row["fake_impressions"].map(lambda x: x.split("|"))
        row["fake_index_interacted"] = row.apply(
            lambda x: x["fake_impressions"].index(x["reference"]) 
            if x["reference"] in x["fake_impressions"] 
            else -1000, axis=1)
        
        return row

    def calculate_features_per_item(self, clickout_id, item_id, price, rank, row):
        obs = row.copy()
        obs["item_id"] = item_id
        obs["item_id_clicked"] = row["reference"]
        obs["was_clicked"] = int(row["reference"] == item_id)
        obs["clickout_id"] = clickout_id
        obs["rank"] = rank
        obs["price"] = price
        obs["current_filters"] = row["current_filters"]
        obs["clickout_step_rev"] = row["clickout_step_rev"]
        obs["clickout_step"] = row["clickout_step"]
        obs["clickout_max_step"] = row["clickout_max_step"]
        self.update_obs_with_acc(obs, row)
        del obs["fake_impressions"]
        del obs["fake_impressions_raw"]
        del obs["fake_prices"]
        del obs["impressions"]
        del obs["impressions_hash"]
        del obs["impressions_raw"]
        del obs["prices"]
        del obs["action_type"]
        return obs
    

    def update_obs_with_acc(self, obs, row):
        features = []
        for acc in self.accumulators:
            value = acc.get_stats(row, obs)
            if hasattr(value, "items"):
                for k, v in value.items():
                    obs[k] = v
                    features.append(k)
            else:
                obs[acc.name] = value

    def generate_features(self):
        output_obs_gen = self.process_rows()
        return self.save_rows(output_obs_gen)

    def save_rows(self, output_obs):
        return [obs for obs in output_obs]

    def process_rows(self):
        for clickout_id, row in enumerate(self.input.to_dict(orient="record")):            
            if row["action_type"] == "clickout item":
                row["impressions_raw"] = row["impressions"]
                row["impressions"] = row["impressions"].split("|")
                row["impressions_hash"] = "|".join(sorted(row["impressions"]))
                row["index_clicked"] = (
                    row["impressions"].index(row["reference"]) if row["reference"] in row["impressions"] else -1000
                )
                row["prices"] = list(map(int, row["prices"].split("|")))
                row["price_clicked"] = row["prices"][row["index_clicked"]] if row["index_clicked"] >= 0 else 0
                for rank, (item_id, price) in enumerate(zip(row["impressions"], row["prices"])):
                    obs = self.calculate_features_per_item(clickout_id, item_id, price, rank, row)
                    yield obs
            
            if int(row["is_test"]) == 0:
                for acc in self.accs_by_action_type[row["action_type"]]:
                    acc.update_acc(row)


numerical_features_info = [
    ("avg_price_similarity", True),
    ("avg_price_similarity_to_interacted_items", True),
    ("avg_price_similarity_to_interacted_session_items", True),
    ("avg_similarity_to_interacted_items", True),
    ("avg_similarity_to_interacted_session_items", True),
    ("clicked_before", False),
    # ItemCTR
    ("clickout_item_clicks", False),
    ("clickout_item_impressions", False),
    ("clickout_item_ctr", False),
    ("clickout_item_ctr_corr", False),
    ("clickout_item_clicks_by_platform_device", False),
    ("clickout_item_impressions_by_platform_device", False),
    ("clickout_item_ctr_by_platform_device", False),
    ("clickout_item_ctr_corr_by_platform_device", False),
    ("clickout_item_clicks_by_platform", False),
    ("clickout_item_impressions_by_platform", False),
    ("clickout_item_ctr_by_platform", False),
    ("clickout_item_ctr_corr_by_platform", False),
    ("clickout_item_clicks_by_device", False),
    ("clickout_item_impressions_by_device", False),
    ("clickout_item_ctr_by_device", False),
    ("clickout_item_ctr_corr_by_device", False),
    ("interact_item_clicks", False),
    ("interact_item_impressions", False),
    ("interact_item_ctr", False),
    ("interact_item_clicks_by_platform_device", False),
    ("interact_item_impressions_by_platform_device", False),
    ("interact_item_ctr_by_platform_device", False),
    ("interact_item_clicks_by_platform", False),
    ("interact_item_impressions_by_platform", False),
    ("interact_item_ctr_by_platform", False),
    ("interact_item_clicks_by_device", False),
    ("interact_item_impressions_by_device", False),
    ("interact_item_ctr_by_device", False),
    ("clickout_user_item_clicks", True),
    ("user_item_ctr", True),
    ("clickout_item_item_last_timestamp", False),
    ("clickout_item_platform_clicks", True),
    ("clickout_prob_time_position_offset", True),
    ("country_eq_platform", False),
    ("fake_last_index_1", False),
    ("fake_last_index_2", False),
    ("fake_last_index_3", False),
    ("fake_last_index_4", False),
    ("fake_last_index_5", False),
    ("fake_last_index_diff_1", False),
    ("fake_last_index_diff_2", False),
    ("fake_last_index_diff_3", False),
    ("fake_last_index_diff_4", False),
    ("fake_last_index_diff_5", False),
    ("fake_n_consecutive_clicks", True),
    ("filter_selection_count", False),
    ("hour", False),
    ("identical_impressions_item_clicks", True),
    ("identical_impressions_item_clicks2", False),
    ("interaction_deal_freq", True),
    ("interaction_img_diff_ts", False),
    ("interaction_img_freq", True),
    ("interaction_info_freq", True),
    ("interaction_item_image_item_last_timestamp", False),
    ("interaction_rating_freq", True),
    ("is_impression_the_same", False),
    ("item_id", True),
    ("item_similarity_to_last_clicked_item", True),
    ("last_index_1", False),
    ("last_index_2", False),
    ("last_index_3", False),
    ("last_index_4", False),
    ("last_index_5", False),
    ("last_index_diff_1", False),
    ("last_index_diff_2", False),
    ("last_index_diff_3", False),
    ("last_index_diff_4", False),
    ("last_index_diff_5", False),
    ("last_ts_diff_1", False),
    ("last_ts_diff_2", False),
    ("last_ts_diff_3", False),
    ("last_ts_diff_4", False),
    ("last_ts_diff_5", False),
    ("last_item_fake_index", False),
    ("last_item_index", False),
    ("last_poi_item_clicks", True),
    ("last_poi_item_ctr", True),
    ("last_poi_item_impressions", True),
    ("last_price_diff", True),
    ("n_consecutive_clicks", True),
    ("n_properties", True),
    ("num_pois", True),
    ("poi_avg_similarity_to_interacted_items", True),
    ("poi_item_similarity_to_last_clicked_item", True),
    ("price", True),
    ("price_vs_max_price", False),
    ("price_vs_mean_price", False),
    ("rank", False),
    ("rating", True),
    ("stars", True),
    ("user_fake_rank_preference", True),
    ("user_impression_rank_preference", True),
    ("user_rank_preference", True),
    ("user_session_rank_preference", True),
    ("was_interaction_deal", False),
    ("was_interaction_img", False),
    ("was_interaction_info", False),
    ("was_interaction_rating", False),
    ("was_item_searched", False),
    ("price_pct_by_city", True),
    ("price_pct_by_platform", True),
    ("session_start_ts", False),
    ("user_start_ts", False),
    ("session_count", False),
    ("step", False),
    ("clickout_step_rev", False),
    ("clickout_step", False),
    ("clickout_max_step", False),
    ("clickout_item_clicks_rank_weighted", False),
    ("clickout_item_impressions_rank_weighted", False),
    ("clickout_item_ctr_rank_weighted", False),
    ("item_clicks_when_last", False),
    ("item_impressions_when_last", False),
    ("item_ctr_when_last", False),
    ("item_average_seq_pos", False),
    ("similar_users_item_interaction", True),
    ("most_similar_item_interaction", True),
    ("datetime_hour", False),
    ("datetime_minute", False),
    ("datetime_local_hour", False),
    ("datetime_local_minute", False),
    ("price_rank_asc", True),
    ("price_rank_desc", True),
    ("price_rank_asc_pct", True),
    ("min_price", True),
    ("max_price", True),
    ("count_price", True),
    ("price_range", True),
    ("price_range_div", True),
    ("price_relative_to_min", True),
    ("item_stats_distance", True),
    ("item_stats_rating", True),
    ("item_stats_popularity", True),
    ("click_sequence_min", False),
    ("click_sequence_max", False),
    ("click_sequence_min_norm", False),
    ("click_sequence_max_norm", False),
    ("click_sequence_len", False),
    ("click_sequence_sd", False),
    ("click_sequence_mean", False),
    ("click_sequence_mean_norm", False),
    ("click_sequence_gzip_len", False),
    ("click_sequence_entropy", False),
    ("fake_click_sequence_min", False),
    ("fake_click_sequence_max", False),
    ("fake_click_sequence_min_norm", False),
    ("fake_click_sequence_max_norm", False),
    ("fake_click_sequence_len", False),
    ("fake_click_sequence_sd", False),
    ("fake_click_sequence_mean", False),
    ("fake_click_sequence_mean_norm", False),
    ("fake_click_sequence_gzip_len", False),
    ("fake_click_sequence_entropy", False),
    # cpp features
    #     ("clickout_counter_vs_interaction_counter_mean", False),
    #     ("mean_rank_counter_mean", False),
    #     ("identifier_counter_min_after", False),
    #     ("interaction_counter_pure", False),
    #     ("identifier_counter_max_after", False),
    #     ("identifier_counter_mean_before_vs_item", False),
    #     ("identifier_counter_prev_2_vs_item", False),
    #     ("interaction_counter_max_vs_item", False),
    #     ("interaction_counter_mean", False),
    #     ("mean_rank_counter_mean_after_vs_item", False),
    #     ("mean_rank_counter_rank_norm_after", False),
    #     ("mean_rank_counter_max_vs_item", False),
    #     ("mean_rank_counter_min", False),
    #     ("impression_counter_prev_1_vs_item", False),
    #     ("impression_counter_mean_before_vs_item", False),
    #     ("clickout_counter_vs_impression_counter_max_after", False),
    #     ("clickout_counter_vs_impression_counter_max_before", False),
    #     ("identifier_counter_rank_norm_after", False),
    #     ("impression_counter_rank_norm", False),
    #     ("impression_counter_mean_prev_3_vs_item", False),
    #     ("clickout_counter_vs_interaction_counter_pure", False),
    #     ("impression_counter_min_before_vs_item", False),
    #     ("top_7_impression_counter_mean_first_3_vs_item", False),
    #     ("interaction_counter_vs_impression_counter_max_before", False),
    ("price_rem", False),
    ("are_price_sorted", False),
    ("are_price_sorted_rev", False),
    ("prices_sorted_until", False),
    ("prices_sorted_until_current_rank", False),
    ("wrong_price_sorting", False),
    ("clickout_uniq_interactions", False),
    ("clickout_item_uniq_prob", True),
    ("interact_uniq_interactions", False),
    ("interact_item_uniq_prob", True),
    ("pairwise_1_ctr_left_won", False),
    ("pairwise_1_ctr_right_won", False),
    ("pairwise_1_ctr_draw", True),
    ("pairwise_1_rel", False),
    ("pairwise_2_ctr_left_won", False),
    ("pairwise_2_ctr_right_won", False),
    ("pairwise_2_ctr_draw", False),
    ("pairwise_2_rel", False),
    ("average_fresh_rank", True),
    ("average_fresh_rank_rel", False),
    ("last_item_timestamp", True),
    ("last_item_click_same_user", False),
    ("item_was_in_prv_clickout", False),
    ("item_clickouts_intersection", False),
    ("rank_based_ctr", False),
    ("item_last_rank", False),
    ("item_avg_rank", False),
    ("user_item_avg_attention", False),
    ("is_item_within_avg_span", False),
    ("is_item_within_avg_span_2s", False),
    ("predicted_ind_minmax_by_user_id", False),
    ("predicted_ind_rel_minmax_by_user_id", False),
    ("ind_per_ts_minmax_by_user_id", False),
    ("predicted_ind_lr_by_user_id", False),
    ("predicted_ind_rel_lr_by_user_id", False),
    ("predicted_ind_rel_minmax_by_session_id", False),
    ("ind_per_ts_minmax_by_session_id", False),
]

numerical_features_for_ranking_py = [f for f, rank in numerical_features_info if rank]
numerical_features_py = [f for f, rank in numerical_features_info]
categorical_features_py = [
    "device",
    "platform",
    "last_sort_order",
    "last_filter_selection",
    "country",
    "continent",
    "hotel_cat",
    "city",
    "last_poi",
    "user_id_1cat",
    "cat_action_index_0",
    "cat_action_index_0_norm",
    "cat_action_index_1",
    "cat_action_index_1_norm",
    "cat_action_index_2",
    "cat_action_index_2_norm",
    "cat_action_index_3",
    "cat_action_index_3_norm",
    "cat_action_index_4",
    "cat_action_index_4_norm",
    "cat_action_index_5",
    "cat_action_index_5_norm",
    "cat_action_index_6",
    "cat_action_index_6_norm",
    "cat_action_index_7",
    "cat_action_index_7_norm",
    "cat_action_index_8",
    "cat_action_index_8_norm",
    "cat_action_index_9",
    "cat_action_index_9_norm",
]
numerical_features_offset_2 = [
    "was_interaction_info", "was_interaction_img", "last_index_diff_5"]

categorical_features=categorical_features_py
numerical_features=numerical_features_py
numerical_features_offset_2=numerical_features_offset_2
numerical_features_for_ranking=numerical_features_for_ranking_py

def identity(x):
    return x


def fillna_with_unk(x):
    return "UNK" if x != x else x


def split_by_pipe(x):
    return x.split("|")


def make_vectorizer_1(
    categorical_features=categorical_features_py,
    numerical_features=numerical_features_py,
    numerical_features_offset_2=numerical_features_offset_2,
    numerical_features_for_ranking=numerical_features_for_ranking_py,):
    return make_pipeline(
        FeatureEng(),
        ColumnTransformer(
            [
                (
                    "numerical",
                    make_pipeline(PandasToNpArray(), SimpleImputer(strategy="constant", fill_value=-9999)),
                    numerical_features,
                ),
                (
                    "numerical_context",
                    make_pipeline(LagNumericalFeaturesWithinGroup(), MinimizeNNZ()),
                    numerical_features + ["clickout_id"],
                ),
                (
                    "numerical_context_offset_2",
                    make_pipeline(LagNumericalFeaturesWithinGroup(offset=2), MinimizeNNZ()),
                    numerical_features_offset_2 + ["clickout_id"],
                ),
                (
                    "categorical",
                    make_pipeline(PandasToRecords(), DictVectorizer(), SparsityFilter(min_nnz=5)),
                    categorical_features,
                ),
                (
                    "numerical_ranking",
                    make_pipeline(RankFeatures(ascending=False), MinimizeNNZ()),
                    numerical_features_for_ranking + ["clickout_id"],
                ),
                (
                    "numerical_ranking_rev",
                    make_pipeline(RankFeatures(ascending=True), MinimizeNNZ()),
                    numerical_features_for_ranking + ["clickout_id"],
                ),
                ("properties", CountVectorizer(tokenizer=identity, lowercase=False, min_df=2), "properties"),
                (
                    "current_filters",
                    CountVectorizer(preprocessor=fillna_with_unk, tokenizer=split_by_pipe, min_df=2),
                    "current_filters",
                ),
                (
                    "alltime_filters",
                    CountVectorizer(preprocessor=fillna_with_unk, tokenizer=split_by_pipe, min_df=2),
                    "alltime_filters",
                ),
                #("last_10_actions", CountVectorizer(ngram_range=(3, 3), tokenizer=list, min_df=1), "last_10_actions"),
                ("last_poi_bow", CountVectorizer(min_df=5), "last_poi"),
                ("last_event_ts_dict", DictVectorizer(), "last_event_ts_dict"),
                ("actions_tracker", DictVectorizer(), "actions_tracker"),
                (
                    "absolute_rank_0_norm",
                    FeaturesAtAbsoluteRank(rank=0, normalize=True),
                    ["price_vs_mean_price", "rank", "clickout_id"],
                ),
            ]
        ),
    )


col_p_props = [
    (
        "numerical",
        numerical_features,
    ),
    (
        "numerical_context",
        numerical_features + ["clickout_id"],
    ),
    (
        "numerical_context_offset_2",
        numerical_features_offset_2 + ["clickout_id"],
    ),
    (
        "categorical",
        categorical_features,
    ),
    (
        "numerical_ranking",
        numerical_features_for_ranking + ["clickout_id"],
    ),
    (
        "numerical_ranking_rev",
        numerical_features_for_ranking + ["clickout_id"],
    ),
    ("properties", "properties"),
    (
        "current_filters",
        "current_filters",
    ),
    (
        "alltime_filters",
        "alltime_filters",
    ),
    # ("last_10_actions", "last_10_actions"),
    ("last_poi_bow", "last_poi"),
    ("last_event_ts_dict", "last_event_ts_dict"),
    ("actions_tracker", "actions_tracker"),
    (
        "absolute_rank_0_norm",
        ["price_vs_mean_price", "rank", "clickout_id"],
    ),
]


accs = get_accumulators()


def predict(data):
    print(data)
    data = pd.DataFrame(data)
    event_sorted = get_event_sorted(data)

    feature_generator = FeatureGenerator(
        limit=None,
        accumulators=accs,
        save_only_features=False,
        input_df=event_sorted.fillna("")
    )

    feats2 = feature_generator.generate_features()
    vectorizer = make_vectorizer_1()

    df2 = pd.DataFrame(feats2).reset_index(drop=True)
    feat_gen_file = "session_rt_02.csv"

    df2.to_csv(feat_gen_file,index=False)
    df2 = pd.read_csv(feat_gen_file)
    vectorizer.fit(df2)
    
    df2 = pd.read_csv(feat_gen_file)
    result = vectorizer.transform(df2)

    df_to_fit = pd.read_csv(feat_gen_file)
    df_feat = vectorizer.steps[0][-1].transform(df_to_fit)
    # print("feat eng")

    mat_arr = []
    for i, (_, cols) in enumerate(col_p_props):
        # print(i, type(cols))
        vectorizer.steps[1][-1].transformers[i][1].fit(df_feat[cols])
        
    df_to_fit = pd.read_csv(feat_gen_file)
    df_feat = vectorizer.steps[0][-1].transform(df_to_fit)
    for i, (_, cols) in enumerate(col_p_props):
        # print(i, type(cols))
        mat_arr.append(vectorizer.steps[1][-1].transformers[i][1].transform(df_feat[cols]))

    features = numerical_features.copy()
    features = ["0_"+f for f in features]
    # print("col analysis")
    for i, mat in enumerate(mat_arr):
        # print(i, mat.shape, end=": ")
        try:
            # print(mat.columns.shape[0])
            features.extend([str(i)+"_"+f for f in mat.columns.tolist()])
        except:
            if i == 3:
                cate_pipe = vectorizer.steps[1][-1].transformers[i][1]
                cate_cols = cate_pipe.steps[1][-1].get_feature_names()
                cate_over_5 = [cate for cate, b in zip(cate_cols, (cate_pipe.steps[2][-1].sparsity >= 5)) if b]
                features.extend(cate_over_5)
                # print(len(cate_over_5))
            elif i == (13-1):
                features.append("_")
                continue
            elif i > 3:
                feats = vectorizer.steps[1][-1].transformers[i][1].get_feature_names()
                # print(len(feats))
                col_name = vectorizer.steps[1][-1].transformers[i][-1]
                features.extend([col_name+"_"+feat for feat in feats])

    print(len(features))

    df_val = pd.DataFrame(result, columns=features)

    feats_on = get_same_features(features, tot_features)
    feats_not = get_not_in_total_features(features, tot_features)

    df = df_val.assign(**{col:0 for col in feats_not})
    X_val = df[tot_features]

    pred = model.predict(X_val)
    print(pred)
    return pred

from multiprocessing import Pool

df_feat = None
vectorizer = None

def f(x):
    return vectorizer.steps[1][-1].transformers[x[0]][1].transform(df_feat[x[1]])

def predict3(data):
    global df_feat
    global vectorizer
    data = pd.DataFrame(data)
    event_sorted = get_event_sorted(data)

    feature_generator = FeatureGenerator(
        limit=None,
        accumulators=accs,
        save_only_features=False,
        input_df=event_sorted.fillna("")
    )

    feats2 = feature_generator.generate_features()
    vectorizer = make_vectorizer_1()

    df2 = pd.DataFrame(feats2).reset_index(drop=True)
    feat_gen_file = "session_rt_02.csv"
    df2.to_csv(feat_gen_file,index=False)
    df_to_fit = pd.read_csv(feat_gen_file)
    df_to_fit2 = df_to_fit.copy()
    df_feat = vectorizer.steps[0][-1].transform(df_to_fit)
    # print("feat eng")

    mat_arr = []
    for i, (_, cols) in enumerate(col_p_props):
        # print(i, type(cols))
        vectorizer.steps[1][-1].transformers[i][1].fit(df_feat[cols])
    
    df_to_fit = df_to_fit2
    df_feat = vectorizer.steps[0][-1].transform(df_to_fit)
    
    with Pool(5) as p:
        mat_arr = p.map(f, [(i, cols) for i, (_, cols) in enumerate(col_p_props)])
    

    features = numerical_features.copy()
    features = ["0_"+f for f in features]
    # print("col analysis")
    for i, mat in enumerate(mat_arr):
        # print(i, mat.shape, end=": ")
        try:
            # print(mat.columns.shape[0])
            features.extend([str(i)+"_"+f for f in mat.columns.tolist()])
        except:
            if i == 3:
                cate_pipe = vectorizer.steps[1][-1].transformers[i][1]
                cate_cols = cate_pipe.steps[1][-1].get_feature_names()
                cate_over_5 = [cate for cate, b in zip(cate_cols, (cate_pipe.steps[2][-1].sparsity >= 5)) if b]
                features.extend(cate_over_5)
                # print(len(cate_over_5))
            elif i == (13-1):
                features.append("_")
                continue
            elif i > 3:
                feats = vectorizer.steps[1][-1].transformers[i][1].get_feature_names()
                # print(len(feats))
                col_name = vectorizer.steps[1][-1].transformers[i][-1]
                features.extend([col_name+"_"+feat for feat in feats])

    print(len(features))
    
    for i in range(len(mat_arr)):
        if hasattr(mat_arr[i], "getnnz"):
            # sparse
            mat_arr[i] = mat_arr[i].A
    result = np.hstack(mat_arr)
    df_val = pd.DataFrame(result, columns=features)

    feats_on = get_same_features(features, tot_features)
    feats_not = get_not_in_total_features(features, tot_features)
    
    for col in feats_not:
        df_val[col] = 0
    X_val = df_val[tot_features]

    pred = model.predict(X_val)
    print(pred)
    return pred


def get_logger(filename="api.log"):
    file_handler = logging.FileHandler(filename=filename)
    stdout_handler = logging.StreamHandler(sys.stdout)
    handlers = [file_handler, stdout_handler]
    logging.basicConfig(
        level=logging.DEBUG,
        format="[%(asctime)s] {%(filename)s:%(lineno)d} %(levelname)s - %(message)s",
        handlers=handlers,
    )
    logger = logging.getLogger("TRIPBIGS")
    return logger

logger = get_logger()


class Log(BaseModel):
    user_id: str
    session_id: str
    timestamp: int
    step: int
    action_type: str
    reference: Optional[str] = None
    platform: Optional[str] = "KR"
    city: str
    device: Optional[str] = "desktop"
    current_filters: Optional[str] = None
    impressions: Optional[str] = None
    prices: Optional[str] = None

class LogList(BaseModel):
    logs: List[Log]

app = FastAPI()

class ModelName(str, Enum):
    alexnet = "alexnet"
    resnet = "resnet"
    lenet = "lenet"

@app.post("/log")
async def create_log(logs: LogList):
    # logger.info(len(logs))
    logger.info(logs.dict())
    result = await predict3(logs.dict()["logs"])
    logger.info(result.shape)
    return {"predict": result.tolist()}


@app.get("/location/{location_id}")
async def root(location_id: int):
    logger.info(accs[0].acc)
    logger.info(accs[1].acc)
    return {"message": f"Hello World {location_id}"}


@app.get("/model/{model_name}")
async def get_model(model_name: ModelName):
    if model_name == ModelName.alexnet:
        return {"model_name": model_name, "message": "Deep Learning FTW!"}

    if model_name.value == "lenet":
        return {"model_name": model_name, "message": "LeCNN all the images"}

    return {"model_name": model_name, "message": "Have some residuals"}


@app.get("/rank/")
async def root(top_n: int = 25, q: Optional[str] = None):
    return {"top": top_n}

