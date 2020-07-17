import axios from 'axios';

// axios.defaults.baseURL = "http://localhost";

const data = {
    "logs": [
        {"user_id": "0A2TX0JNYVQ613921093ldskjsalkjdlkasjldkjasl", 
        "session_id": "0A2TX0JNYVQ613921093ldskjsalkjdlkasjldkjasl", 
        "timestamp": 1595085060, "step": 1, "action_type": "clickout item",
         "reference": "10091602", "platform": "KR", "city": "Seoul, South Korea", "device": "desktop", "current_filters": null, "impressions": "2802232|2733571|5477718|155374|155465|3549258|10091602|6508748|844336|4638538|3501450|390361|3501452|363046|2555968|5197174|4773608|3171165|3954788|6833196|5645106|475256|1627467|4871108|9033886", "prices": "124|176|99|220|191|127|85|54|83|268|78|144|96|78|77|154|135|85|74|115|152|131|83|108|79"}],
    "sid": "session1"
    }

export default {
    getTime: () => {
        return axios.get("time")
    },
    getClickProbs: async () => {
        try {
            const res = await axios.post('predict', data);
            console.log(res.data.predict);
            return res.data.predict
        } catch (err) {
            console.log(err)
            throw err
        }
    }
    // getNewsEverything: (params) => {
    //     params['apiKey'] = API_KEY
    //     console.log(params)
    //     return axios.get('everything',{params})
    // },
    // getHeadlines: async () => {
    //     const params = {
    //         'apiKey': API_KEY,
    //         'country': 'kr'
    //     }
    //     try {
    //         const newsResponse = await axios.get('top-headlines', {params});
    //         return newsResponse.data.articles
    //     } catch (err) {
    //         throw err
    //     }
        
    // }
}