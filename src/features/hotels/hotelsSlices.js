import { createSlice } from '@reduxjs/toolkit'
// import initialHotelsState from './initialState'
import initialHotelsState2 from "./state.json"
import get from 'lodash/get'

// {'id': 10091602,
//  'name': '호텔 그레이스리 서울',
//  'hotelStarRating': 0,
//  'reviewRating': {'index': 5, 'percentage': 8.7},
//  'type': '호텔',
//  'geocode': {'lat': 37.567955, 'lng': 126.977875},
//  'address': {'country': '한국',
//   'street': '12 Sejongdaero 12gil Junggu',
//   'locality': '서울'},
//  'overallLiking': '최고 좋음',
//  'partnerReviewCount': 860,
//  'amenities': [{'title': '무선인터넷',
//    'iconName': 'wifi',
//    'isAvailable': True,
//    'isFreeOfCharge': True,
//    'fieldId': 254}],
//  'images': [{'id': 375295400,
//    'urls': {'preview': '//imgcy.trivago.com/c_fill,d_dummy.jpeg,f_auto,h_272,q_auto,w_272/partnerimages/37/52/375295400.jpeg',
//     'origin': '//imgcy.trivago.com/c_limit,d_dummy.jpeg,f_auto,h_650,q_auto,w_1000/partnerimages/37/52/375295400.jpeg'},
//    'mediaType': 'image/jpeg',
//    'caption': '',
//    'partnerName': '',
//    'isTrivago': False,
//    'type': 'partnerimages',
//    'clickoutLink': ''}],
//  'price': [{'url': 'https://www.zenhotels.com/hotels/?q=3124&dates=05.08.2020-20.08.2020&guests=2&cur=KRW&price=one&room=s-919ef1b8-56a6-5d40-8937-ff6cab0be056&hotelId=hotel_gracery_seoul&utm_source=trivago&utm_term=default&utm_content=ca1d50b3&utm_medium=cpc-metasearch&utm_campaign=ko-kr&from=hotel_gracery_seoul.1196781.KRW.f9586517.h-a8e037ee-b842-5f62-8b63-1f728fda8342&partner_slug=trivago.affiliate.039e3ffd&partner_extra=0f592027-5eef-4ff3-b050-53bbca15db29&sid=155d87f4-2c34-4f37-9df2-bd8e467a288c',
//    'price': 79899.0,
//    'site': '젠호텔'},
//   {'url': 'https://www.agoda.com/ko-kr/search?cid=1763313&currency=KRW&checkin=2020-08-05&checkout=2020-08-20&NumberofAdults=2&NumberofChildren=0&Rooms=1&mcid=332&tchash=VZf8WPQM%2BV8&trv_curr=KRW&trv_dp=80477&trv_ttt=19&trv_tttb=15&trv_los=15&trv_losb=15&trv_pg=0&trv_defdate=0&tag=aed467c4-80d8-4a4f-bd1f-904b1e5dfbd2&hidef=001111&ccallout=1&selectedproperty=4898259&city=14690&adults=2&children=0&hc=KRW&los=15',
//    'price': 80477.0,
//    'site': '아고다'}],
//  'clickProb': 0,
//  'global_eat': ['그랑 아',
//   '화수분베이커리',
//   '커피투어',
//   '브라세리 인 스페이스',
//   '차이야기',
//   '리치몬드제과점',
//   '쿠이신보',
//   '반반국수',
//   '호수집',
//   '수가'],
//  'local_eat': {'루엘드파리|이성당 롯데백화점잠실점': ['안국 153',
//    '에뚜왈',
//    '브레드숨',
//    '삐오꼬 상봉역점',
//    '장가네해물짬뽕',
//    '백화네부엌 교대점',
//    '명화당 명동1호점',
//    '마포만두시청점',
//    '나드리김밥 서울고려대안암병원점',
//    '경성꽈배기 우림점'],
//   '비사벌전주콩나물국밥|소문난감자탕': ['성수족발',
//    '함경도찹쌀순대',
//    '죽변항',
//    '박가부대',
//    '먹거리집',
//    '송림식당',
//    '대성갈비',
//    '대도식당 왕십리본점',
//    '어니언',
//    '청와옥'],
//   '토속촌삼계탕|순희네빈대떡': ['대도식당 왕십리본점',
//    '육회자매집 본점1호점',
//    '밀탑 현대백화점압구정본점',
//    '원할머니 본가 보쌈 - 본가',
//    '진옥화할매원조닭한마리',
//    '혜화돌쇠아저씨',
//    '마포만두',
//    '바토스 이태원점',
//    '유림면',
//    '라세느'],
//   '프릳츠 도화점|카페 노티드 청담점': ['어니언 안국',
//    '비파티세리 공덕점',
//    '다운타우너 청담점',
//    '백록담 디저트작업실',
//    '다운타우너 안국점',
//    '포비 베이직',
//    '커피가게동경',
//    '한남동한방통닭',
//    '쿠차라',
//    '빌라드샬롯 김포공항국내선청사3층점'],
//   '형훈라멘|미미면가': ['브루클린더버거조인트 가로수길점',
//    '온기정',
//    '후와후와',
//    '한성돈까스',
//    '서두산 딤섬',
//    '오복수산 한남',
//    '연립빵공장',
//    '시엠프레꼬모도밍고',
//    '송옥강남본점',
//    '겟썸커피 Shinsa store']}}



// Hotel List Sorting Function

const sortFunction = (hotelList, key, isAsec) => {
    const ascVar = isAsec === true ? -1 : 1;
    return hotelList.slice().sort((a, b)=> {
        if (get(a,key) < get(b,key)) {
            return 1 * ascVar;
        }
        if (get(a,key) > get(b,key)) {
            return -1 * ascVar;
        }
        return 0;
    })
}

function startLoading(state) {
    state.isLoading = true
  }
  
function loadingFailed(state, action) {
    state.isLoading = false
    state.error = action.payload
}

const hotelsSlice = createSlice({
  name: 'hotels',
  initialState: {
      hotelList: initialHotelsState2,
      filter: null,
      isLoading: false,
      error: null
  },
  reducers: {
    sortByPrice(state, action) {
        return {...state,
            hotelList: sortFunction(state.hotelList, "price.1.price", true)
        }
    },
    sortByRating(state, action) {
        return {...state,
            hotelList: sortFunction(state.hotelList, "reviewRating.percentage", false)
        }
    },
    getClickProbs: startLoading,
    getClickProbsSuccess(state, {payload}) {
        const { predicts } = payload
        state.isLoading = false
        state.error = null

        for (var i in state.hotelList) {
            console.log(state.hotelList[i].clickProb, predicts[i])
            state.hotelList[i].clickProb = predicts[i]
        }

        // state.hotelList.forEach((hotel, index) => {
        //     hotel
        // })
        // const newhotellist = produce(state.hotelList, draft => {
        //     for (var i in draft) {
        //         console.log(draft[i].clickProb, predicts[i])
        //         draft[i].clickProb = predicts[i]
        //     }
        // })
        // console.log("new", newhotellist)

        // return {...state,
        //     hotelList: newhotellist
        // }
    },
    getClickProbsFailure: loadingFailed,
    sortByClickProb(state, action) {
        return { ...state,
        hotelList: sortFunction(state.hotelList, "clickProb", false)}
    }
  },
})

export const { sortByPrice, sortByRating, getClickProbs, getClickProbsSuccess, getClickProbsFailure, sortByClickProb } = hotelsSlice.actions;

export default hotelsSlice.reducer