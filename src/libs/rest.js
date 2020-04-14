import Vue from 'vue'
import VueResource from 'vue-resource';
import {_} from './util'
import util from './util'

Vue.use(VueResource)

const http = Vue.http

function rest(res_name) {
    this.res_name = res_name
    this._filters = []
    this._success = null
    this._failure = null
    this._confirm = null
    this._confirmed = null
    this.init()
}

rest.prototype.init = function(){
    this._empty = null
    this._refresh = null
    this._url_params = []
    this.$list = []
    this.$data = {}
    this.$string = ''
    this.$response = {}
    this.$code = null
    this.$loading = false
    this.$loaded  = false
    this.$saving  = false
    this.$empty  = null
    this.$error  = ''
    this.params  = {}
    this.$Modal = Vue.prototype.$Modal
}

rest.prototype.sql = function(field,value,condition){
	let format = '%s',
		sql = ''
	condition = condition?condition + ',':''
	if(_.isArray(value)){
		value = value.join(',')	
		condition = 'IN'
		format = '[%s,%s]'
	}
	if(condition != ''){
		format = '[%s,%s]'
		sql = util.sprintf(format,condition,value)		
	}else{
		sql = util.sprintf(format,value)
	}
	if(value!=''){
		this.params[field] = sql	
	}	
	return this
}


rest.prototype.sqlOr = function(field,value,condition){
	condition = condition?condition + ',':''
	if(_.isArray(value)){
		value = value.join(',')
		condition = 'IN,'
	}
	if(value!=''){
		this.params[field] = util.sprintf('[OR,%s%s]',condition,value)	
	}	
	return this
}

rest.prototype.url = function() {
    var url = this.res_name;
    if (this._url_params.length > 0) {
        url += '/' + this._url_params.join('/')
    }
    return url
}

rest.prototype.add_url_param = function() {
    if(arguments.length == 0){
        return this
    }
    for(var i=0,l=arguments.length;i<l;i++){
        this._url_params.push(arguments[i])
    }
    return this
}

rest.prototype.set_url_param = function(){
    if(arguments.length == 0){
        return this
    }
    this.init()
    for(var i=0,l=arguments.length;i<l;i++){
        this._url_params.push(arguments[i])
    }
    return this
}

rest.prototype.set_list = function(list){
    this.$loaded = true
    this.$loading = false
    this.$list = list
}

rest.prototype.get = function(params) {
    const $this = this
    params = params || {}
    if(!_.isEmpty(this.params)){
	    for(let o in this.params){
	    	params[o] = this.params[o]
	    }
	    this.params = {}
    }
    this.$loading = true
    this.$loaded  = false
    http.get(this.url(),{
    	params:params
    })
    .then(response=>{
    	let list = []
    	$this.$loading = false
    	$this.$loaded  = true
    	$this.$code    = response.body.error
    	$this.$response = response.body
    	if(this.$code != 0){
    		if(response.body.message){
    			$this.$msg = response.body.message
    		}
    		return
    	}

    	if(_.isArray(response.body.data)){
			list.concat(response.body.data)
		}else if(_.isObject(response.body.data)){
			this.$data = response.body.data
		}

    	if($this._filters.length > 0){
    		$this._filters.forEach(fn=>{
    			if(_.isFunction(fn)){
    				list = fn(list)
    			}
    		})
    	}

    	if(list.length == 0 && _.isFunction($this._empty)){
    		$this.$empty = true
    		$this._empty()
    	}

    	$this.$list = list

    	if (_.isFunction($this._refresh)) {
            $this._refresh(list);
        }
		
		if(_.isFunction(this._success)){
			this._success(response.body.data,response,$this)
		}
        	

    },response=>{
    	$this.$loading = false
    	$this.$error   = response.message

    	if(_.isFunction(this._failure)){
			this._failure(response,$this)
		}
    })
    return this;
}


rest.prototype.confirm = function(fn){
    this._confirm = fn
    return this
}

rest.prototype.confirmed = function(fn){
    this._confirmed = fn
    return this
}

rest.prototype.success = function(fn) {
    this._success = fn
    return this
}

rest.prototype.error = function(fn) {
    this._failure = fn
    return this
}

rest.prototype.post = function(data,options) {
    const $this = this
	options = options||{}
	this.$saving = true
    http.post(this.url(), data,options)
    .then(response=>{
    	this.$saving = false
    	this.$code   = response.body.error
    	if(this.$code == 1){
    		if(_.isFunction(this._confirm)){
    			this._confirm(response.body,$this)
    		}else{
    			//重新提交
	    		this.$Modal.confirm({
	                title: '确认操作',
	                render: (h) => {
	                	let checkbox_div = h('span','')
	                	if(response.body.option){
	                		//如果包含 班级物品 参数
	                		options.params = options.params || {}
	                		options.params.is_buy_material = 0
	                		
	    					checkbox_div = h('div',{'class':'mt-3'},[			                				
				                				h('input',{
				                					attrs: {
				                						type: 'checkbox',
				                						id: 'material',
				                						checked: false
				                					},                					
				                					on:{
				                						change: (event)=>{
				                							let map_val = {true: 1,false: 0}				                							
				                							options.params.is_buy_material = map_val[event.target.checked]
				                						}
				                					}
				                				}),
				                				h('label',{
				                					attrs: {
				                						'for': 'material'
				                					}
				                				},'是否购买物品')
				                			]) 
		    			}
	                	
	                	
	                	return h('div',{'class':'ivu-modal-confirm'},
		                	[
		                		h('div',{'class':'ivu-modal-confirm-body'},
			                		[
			                			h('div',{'class':'ivu-modal-confirm-body-icon ivu-modal-confirm-body-icon-confirm'},[
			                				h('i',{'class':'ivu-icon ivu-icon-help-circled'})
			                			]),
			                			h('div',response.body.confirm),
			                			checkbox_div
			                		]
		                		)
		                	]
	                	)
	                },
	                onOk: () => {
			        if(_.isFunction(this._confirmed)){
                            this._confirmed($this)
                        }
	                	options.params = options.params || {}
	                	options.params.force = 1
	                    this.post(data,options)
	                },
	                onCancel: () => {
	                    //todo
	                }
	            });
    		}
    	}else{
    		if(_.isFunction(this._success)){
    			this._success(response.body,$this)
    		}
    	}
    },response=>{
    	this.$saving = false
    	$this.$error   = response.body.message
    	if(_.isFunction(this._failure)){
			this._failure(response,$this)
		}
    })
    return this
}

rest.prototype.put = function(data,options) {
    const $this = this
	options = options || {}
	this.$saving = true
	http.put(this.url(), data,options)
    .then(response=>{
    	this.$saving = false
    	this.$code   = response.body.error
    	if(this.$code == 1){
    		if(_.isFunction(this._confirm)){
    			this._confirm(response.body,$this)
    		}else{
    			//重新删除
	    		this.$Modal.confirm({
	                title: '确认操作',
	                content: response.body.confirm,
	                onOk: () => {
                        if(_.isFunction(this._confirmed)){
                            this._confirmed($this)
                        }
	                	options.params.force = 1
	                    this.put(data,options)
	                },
	                onCancel: () => {
	                    //todo
	                }
	            });
    		}
    	}else{
    		if(_.isFunction(this._success)){
    			this._success(response.body,$this)
    		}
    	}
    },response=>{
    	this.$saving = false
    	$this.$error   = response.body.message
    	if(_.isFunction(this._failure)){
			this._failure(response,$this)
		}
    })
    return this
}

rest.prototype.filter = function(fn) {
    this._filters.push(fn)
    return this;
}

rest.prototype.empty = function(fn) {
    this._empty = fn
    return this;
}

rest.prototype.refresh = function(fn) {
    this._refresh = fn
    return this;
}

rest.prototype.refresh = function(fn){
	this._cnfirm = fn
}

rest.prototype.delete = function(ids,options) {
	const $this = this
	options = options||{}
    if (_.isArray(ids)) {
        ids = ids.join(',');
    }
    this.$saving = true

    http.delete(this.url() + '/' + ids,options)
    .then(response=>{
    	$this.$saving  = false
    	$this.$code    = response.body.error
    	$this.$response = response.body

    	if(response.body.error == 1){
    		if(_.isFunction(this._confirm)){
    			this._confirm(response.body,$this)
    		}else{
    			//重新删除
    			let confirm_title = response.body.title || '请确认'
    			setTimeout(()=>{
    				this.$Modal.confirm({
		                title: confirm_title,
		                content: response.body.confirm,
		                onOk: () => {
                            if(_.isFunction(this._confirmed)){
                                this._confirmed($this)
                            }
		                	options.params = options.params || {}
		                	options.params.force = 1
		                    this.delete(ids,options)
		                },
		                onCancel: () => {
		                    //todo
		                }
		            });
    			},300)
	    		
    		}
    	}else{
    		if(_.isFunction(this._success)){
    			this._success(response.body,$this)
    		}
    	}
    },response=>{
    	$this.$saving = false
    	$this.$error   = response.body.message
    	if(_.isFunction(this._failure)){
			this._failure(response,$this)
		}
    })
    return this
}


function $rest(res_name) {
    return new rest(res_name);
}

$rest.get 		= Vue.http.get;
$rest.post 		= Vue.http.post;
$rest.put 		= Vue.http.put;
$rest.delete 	= Vue.http.delete;

export default $rest;