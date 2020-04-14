<template>
	<Modal v-drag-modal :mask-closable="false" width="600" v-model="modal$.show" :title="modal$.title">
		<template v-if="modal$.show">
			<div class="row" style="height:280px">
				<div class="col-sm-5">
					<DatePicker
						type="date"
				        :open="true"
				        :value="format_day(info.int_day)"
				        :options="options"
				        @on-change="info.int_day = $event"
				        >
				        <a href="javascript:void(0)">
				            <Icon type="ios-calendar-outline"></Icon>
				            <template>{{ info.int_day }}</template>
				        </a>
				    </DatePicker>
				</div>
				<div class="col-sm-7">
					<label>事项：</label>
					<Input v-model="info.desc" type="textarea" :rows="4"></Input>
					<div class="text-center mt-4">
						<Time-picker
							confirm
							style="width:80px"
							:value="format_hour(info.int_hour)" 
							placeholder="提醒时间"
							format="HH:mm" 
							@on-change="info.int_hour = $event" 
							>
						</Time-picker>
					</div>
					<div class="text-center mt-4">
						<Button type="primary" :loading="saving" @click="save">立即生效</Button>
					</div>
				</div>
			</div>
		</template>
    	<div slot="footer">
            <Button type="ghost" @click="close">关闭</Button>
        </div>
    </Modal>
</template>

<script>
	import util from '@/libs/util'
	import {_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import moment from 'moment'
	import globals from '@/libs/globals.mixin'
	
	const INFO_NAME = '待办'
	const INFO_PK_ID = 'bl_id'
	const INFO_URL   = 'backlogs'

	const emptyObject = {
		desc: '',
		int_day: date(),
		int_hour: time()
	}
	function date() {
		return moment(new Date()).format('YYYY-MM-DD')
	}
	function time() {
		return moment(new Date(Date.now()+1000*60)).format('HH:mm')
	}

	export default{
		name:'todoListInfo',
		mixins:[modal,common,globals],
		components: {
			
		},
		props:{
			editMode:{
				type:String,
				default:'all'
			}
		},
		data () {
			return {
				info: util.copy(emptyObject),
				options: {
                    disabledDate (date) {
                        return date && date.valueOf() < Date.now() - 86400000;
                    }
                },
			}
		},
		mounted () {
			
		},
		methods: {
        	save() {
        		if(this.info.desc  === '') {
        			this.$Message.error('待办事项不能为空')
        			return false
        		}
        		let date = this.info.int_day+' '+this.info.int_hour
        		if(Date.parse(date)-Date.now()<=0) {
        			this.$Message.error('您设置的提醒时间已经过去，请重新设置')
        			return false
        		}
        		let method = this.modal$.action == 'add'?'post':'put'
                let action = this.modal$.action == 'add'?'添加':'编辑'
                let $rest  = this.$rest(this.info_url$)
                if(this.modal$.action != 'add'){
                    $rest.add_url_param(this.info[this.info_pk_id$])
                }
                $rest[method](this.info)
                .success(response=>{
                    let data = response.data
                    
                    if(this.modal$.action == 'add' && _.isString(data) && /^\d+$/.test(data)){
                        this.info[this.info_pk_id$] = util.int(data)
                    }
                    this.$Message.success(util.sprintf('%s%s成功!',this.info_name$,action))
                    this.$emit('save',{action:this.modal$.action,data:this.info})
                    if(_.isDefined(this.$store.state.gvars[this.info_url$])){
                        this.$store.dispatch('updateGlobalVar',this.info_url$)
                    }
                    this.close()
                })
                .error(response=>{
                    this.error(response.body.message)
                })
        	},
		},
		computed: {
			info_url$(){
            	return INFO_URL
	        },
	        info_name$(){
	            return INFO_NAME
	        },
	        info_pk_id$(){
	            return INFO_PK_ID
	        },
	        today() {
	        	return moment(new Date()).format('YYYY-MM-DD')
	        },
		},
		watch: {
			'modal$.show': function(val) {
            	if(val&&this.modal$.action == 'add'){
					this.info = util.copy(emptyObject)
				}	            
	        }
        }
	}
</script>
<style lang="less">
</style>
