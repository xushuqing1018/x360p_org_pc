import util,{_} from '@/libs/util'

export default{
	filters: {
		pub_int_date (val) {
			let [year,month,day] = ['','','']					 
				
			val = String(val)
			
			if(val && val != ''){
				year = val.substring(0,4)
			}
			
			if(Number(val.substring(4)) < 12) {
				month = '-' + val.substring(4)	
			}else{
				let m_and_d = val.substring(4) 
				
				if(m_and_d.length == 2){
					month = '-' + m_and_d.substring(0,1) 
					day = '-' + m_and_d.substring(1)
				}else if(m_and_d.length == 3){
					if(Number(m_and_d.substring(0,2)) > 12){
						month = '-' + m_and_d.substring(0,1) 
						day = '-' + m_and_d.substring(1)	
					}
					else{
						month = '-' + m_and_d.substring(0,2) 
						day = '-' + m_and_d.substring(2)
					}						
				}else{
					month = '-' + m_and_d.substring(0,2) 
					day = '-' + m_and_d.substring(2)
				}
			}
			
			
			return year + month + day
		}
	},
	methods: {
		borrowInfo () {
			this.$Modal.open('app/books/borrow-modal.vue',{
				on: {
					'on-success': ()=>{
						this.init_data()
					}
				}
			})
			.then(modal=>{
				modal.show('借书')
			})
		},
		borrowRecord (item) {
			let title = '借阅记录',
				bkId = 0
			
			if(!_.isEmpty(item)){
				bkId = item.bk_id
				title = `【${item.name}】借阅记录`
			}
			
			this.$Modal.open('app/books/borrow-record.vue@modal',{
				props:{
					bkId: bkId
				},
				on: {
					'on-success': ()=>{
						this.init_data()
					}
				}					
			})
			.then(modal=>{
				modal.show(title)
			})
		},
	}
}
