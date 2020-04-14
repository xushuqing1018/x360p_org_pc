import util from '@/libs/util'
import {_} from '@/libs/util'

export default {
	data(){
        return {
            modal$:{
                show:false,
                title:'',
                action:''
            }
        }
    },
    watch:{
        'modal$.show':function(val){
            if(!val){
                this.$emit('on-close')
            }
        }
    },
    methods:{
    	show(title,action){
            title  = title  || '提示'
            action = action || 'add'
            if(action == 'add' && this.info && this.info_pk_id$ && this.info[this.info_pk_id$]){
                delete this.info[this.info_pk_id$]
            }
    		this.modal$.show        = true
            this.modal$.title       = title
            this.modal$.action      = action
            return this
    	},
        set(key,value,copy){
            copy = copy || true
            if(copy){
                this.$set(this,key,util.copy(value))
            }else{
                this.$set(this,key,value)
            }
            return this
        },
        setAction(action){
            this.modal$.action = action
            return this
        },
    	close(){
    		this.modal$.show = false
            this.$emit('on-close')
            return this
    	},
        save(){
        	return new Promise((resolve,reject)=>{
        		this.$form('form').check().then(form=>{
	                if(this.info.bid == 0){
	                    this.info.bid = this.$store.state.branch.id
	                }
	                let method = this.modal$.action == 'add'?'post':'put'
	                let action = this.modal$.action == 'add'?'添加':'编辑'
	                let $rest  = this.$rest(this.info_url$)
	                if(this.modal$.action != 'add'){
	                    $rest.add_url_param(this.info[this.info_pk_id$])
	                }else{
                        if(this.info && this.info_pk_id$ && this.info[this.info_pk_id$]){
                            delete this.info[this.info_pk_id$]
                        }
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
	                    resolve()
	                })
	                .error(response=>{
	                	reject()
	                    this.error(response.body.message)
	                })
	            })
        	})
        }
    }
}