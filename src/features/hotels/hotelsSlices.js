import { createSlice } from '@reduxjs/toolkit'
import initialHotelsState from './initialState'
import get from 'lodash/get'

// {'id': 10091602,
//  'name': '그레이스리 호텔 서울',
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
//    'fieldId': 254},
//   {'title': '에어컨',
//    'iconName': 'ac',
//    'isAvailable': True,
//    'isFreeOfCharge': False,
//    'fieldId': 86},
//   {'title': '주차장',
//    'iconName': 'parking',
//    'isAvailable': True,
//    'isFreeOfCharge': False,
//    'fieldId': 25},
//   {'title': '레스토랑',
//    'iconName': 'restaurant',
//    'isAvailable': True,
//    'isFreeOfCharge': False,
//    'fieldId': 47},
//   {'title': '텔레비전',
//    'iconName': 'pay_tv',
//    'isAvailable': False,
//    'isFreeOfCharge': False,
//    'fieldId': 90},
//   {'title': '수영장',
//    'iconName': 'pool',
//    'isAvailable': False,
//    'isFreeOfCharge': False,
//    'fieldId': 35},
//   {'title': '스파',
//    'iconName': 'spa',
//    'isAvailable': False,
//    'isFreeOfCharge': False,
//    'fieldId': 60},
//   {'title': '반려동물 동반 가능',
//    'iconName': 'pet',
//    'isAvailable': False,
//    'isFreeOfCharge': False,
//    'fieldId': 30},
//   {'title': '호텔 바',
//    'iconName': 'bar',
//    'isAvailable': False,
//    'isFreeOfCharge': False,
//    'fieldId': 31},
//   {'title': '헬스클럽',
//    'iconName': 'gym',
//    'isAvailable': False,
//    'isFreeOfCharge': False,
//    'fieldId': 23}],
//  'images': [{'id': 375295400,
//    'urls': {'preview': '//imgcy.trivago.com/c_fill,d_dummy.jpeg,f_auto,h_272,q_auto,w_272/partnerimages/37/52/375295400.jpeg',
//     'origin': '//imgcy.trivago.com/c_limit,d_dummy.jpeg,f_auto,h_650,q_auto,w_1000/partnerimages/37/52/375295400.jpeg'},
//    'mediaType': 'image/jpeg',
//    'caption': '',
//    'partnerName': '',
//    'isTrivago': False,
//    'type': 'partnerimages',
//    'clickoutLink': ''},
//   {'id': 375295402,
//    'urls': {'preview': '//imgcy.trivago.com/c_fill,d_dummy.jpeg,f_auto,h_272,q_auto,w_272/partnerimages/37/52/375295402.jpeg',
//     'origin': '//imgcy.trivago.com/c_limit,d_dummy.jpeg,f_auto,h_650,q_auto,w_1000/partnerimages/37/52/375295402.jpeg'},
//    'mediaType': 'image/jpeg',
//    'caption': '',
//    'partnerName': '',
//    'isTrivago': False,
//    'type': 'partnerimages',
//    'clickoutLink': ''},
//   {'id': 375295408,
//    'urls': {'preview': '//imgcy.trivago.com/c_fill,d_dummy.jpeg,f_auto,h_272,q_auto,w_272/partnerimages/37/52/375295408.jpeg',
//     'origin': '//imgcy.trivago.com/c_limit,d_dummy.jpeg,f_auto,h_650,q_auto,w_1000/partnerimages/37/52/375295408.jpeg'},
//    'mediaType': 'image/jpeg',
//    'caption': '',
//    'partnerName': '',
//    'isTrivago': False,
//    'type': 'partnerimages',
//    'clickoutLink': ''},
//   {'id': 323386038,
//    'urls': {'preview': '//imgcy.trivago.com/c_fill,d_dummy.jpeg,f_auto,h_272,q_auto,w_272/partnerimages/32/33/323386038.jpeg',
//     'origin': '//imgcy.trivago.com/c_limit,d_dummy.jpeg,f_auto,h_650,q_auto,w_1000/partnerimages/32/33/323386038.jpeg'},
//    'mediaType': 'image/jpeg',
//    'caption': '',
//    'partnerName': 'Amoma.com',
//    'isTrivago': False,
//    'type': 'partnerimages',
//    'clickoutLink': ''},
//   {'id': 375295406,
//    'urls': {'preview': '//imgcy.trivago.com/c_fill,d_dummy.jpeg,f_auto,h_272,q_auto,w_272/partnerimages/37/52/375295406.jpeg',
//     'origin': '//imgcy.trivago.com/c_limit,d_dummy.jpeg,f_auto,h_650,q_auto,w_1000/partnerimages/37/52/375295406.jpeg'},
//    'mediaType': 'image/jpeg',
//    'caption': '',
//    'partnerName': '',
//    'isTrivago': False,
//    'type': 'partnerimages',
//    'clickoutLink': ''}],
//  'price': 100000}


const sortFunction = (state, key, isAsec) => {
    const ascVar = isAsec === true ? 1 : -1
    return state.hotelList.slice().sort((a, b)=> {
        if (a.reviewRating.percentage < b.reviewRating.percentage) {
            return 1 * ascVar;
        }
        if (a.reviewRating.percentage > b.reviewRating.percentage) {
            return -1 * ascVar;
        }
        return 0;
    })
}


const hotelsSlice = createSlice({
  name: 'hotels',
  initialState: {
      hotelList: initialHotelsState,
      filter: null,
  },
  reducers: {
    sortByPrice(state, action) {
        return {...state,
            hotelList: state.hotelList.slice().sort((a, b)=> {
                if (a.price < b.price) {
                    return -1;
                }
                else if (a.price > b.price) {
                    return 1;
                }
                return 0;
            })
        }
    },
    sortByRating(state, action) {
        return {...state,
            hotelList: state.hotelList.slice().sort((a, b)=> {
                if (a.reviewRating.percentage < b.reviewRating.percentage) {
                    return 1;
                }
                if (a.reviewRating.percentage > b.reviewRating.percentage) {
                    return -1;
                }
                return 0;
            })
        }
    }
  },
  extraReducers: {
      "SORT_BY_RATING": (state, action) => {
          return state.hotelList.slice().sort((a, b)=> a.reviewRating.percentage > b.reviewRating.percentage);
      }
  }
})

export const { sortByPrice, sortByRating } = hotelsSlice.actions;
console.log("aaa", initialHotelsState.map((h) => h.name));

console.log(get(initialHotelsState[0], "reviewRating.percentage"))

export const selectHotelList = state => state.hotelList;

export default hotelsSlice.reducer