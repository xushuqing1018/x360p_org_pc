import util from '@/libs/util'
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'

const resName   = 'file'
const idField   = 'file_id'
const textField = 'file_name'

export default {
	mixins: [common,globals],
	data() {
		return {
			new_file_name: '',
			info: {},
			search_field: {
				file_name: ''
			},
			pageSize: 8,
			banFileIds: []
		}
	},
	methods: {
		toggleSelected(item) {
			if(this.multiple){
                if(!item.$selected){
                    this.addSelectedId(item[idField])
                }else{
                    this.removeSelectedId(item[idField])
                }
            }else{
                if(item.$selected){
                    item.$selected = false
                }else{
                    this.data.forEach(item=>{
                    	if(item.$selected) {
                    		item.$selected = false
                    	}
                    })
                    item.$selected = true
                    this.replaceSelectedId(item[idField])
                }
            }
		},
		deal_data(data) {
            if(data.list.length > 0){
            	this.refreshData(data.list)
                this.$store.commit('buildIdTextMap',{
                   list:data.list,
                   name:resName,
                   ifield:idField,
                   tfield:textField
                })
            }
			return data.list
		},
		hook_get_param (params) {
			let search_obj = util.copy(this.search_field)
			for(let o in search_obj) {
				let property = search_obj[o]
				if(property){
					params[o] = property
				}
			}
		},
		resetSearch () {
			this.search_field.file_name = ''
			this.init_data()
		},
		addFileName(item) {
			this.$r('info_name')
			.set('info', item)
			.show('添加文件名','add')
		},
		editFileName(item) {
			this.$r('info_name')
			.set('info', item)
			.show('修改文件名','edit')
		},
		editFileUrl(item){
			this.$r('file_url')
			.set('info', item)
			.show('修改文件URL','edit')
		},
		delFile (item) {
			let tip = util.sprintf('确认删除文件【%s】吗？',item.file_name)
			this.confirm(tip)
			.then(()=>{
				this.$rest('files/delete_files').post({file_ids:[item.file_id]})
		  		.success(response=>{
		  			this.dealDelResult(response.data)				  			
		  		}).error(response=>{
		  			this.error(response.body.message||'删除失败','warn')
		  		})
			})
		},
		dealDelResult (data) {
			if(data.fail_num==0){
				this.$Message.success('删除成功')
				this.init_data()
			}else{
				let tip = ''
				data.error.forEach((e,i)=>{
					let index = this.banFileIds.indexOf(e.file_id)
					if(index==-1){
						this.banFileIds.push(e.file_id)		
					}
					if(i==0){
						tip = e.file_name
					}
				})					
				this.$Message.error(util.sprintf('%s等%s个文件已被回访或其他服务所使用，禁止删除',tip,data.error.length))
			}
  			
		}
	}
}