import moment from 'moment'
import {_} from './util'
import util from './util'
import table2excel from '@/libs/table2excel.js'
import store from '@/store/index'

function form(name,v){
	this._form = v.$refs[name]
	return this
}

form.prototype.check = function(){
	return new Promise((resolve,reject)=>{
		this._form.validate((valid)=>{
			if(valid){
				resolve(this._form)
			}else{
				reject()
			}
		})
	})
}

form.prototype.reset = function(){
	this._form.resetFields()
	return this
}

function broadcast(componentName, eventName, params) {
    this.$children.forEach(child => {
        const name = child.$options.name;

        if (name === componentName) {
            child.$emit.apply(child, [eventName].concat(params));
        } else {
            // todo 如果 params 是空数组，接收到的会是 undefined
            broadcast.apply(child, [componentName, eventName].concat([params]));
        }
    });
}

const FAMILY_REL_MAP = {1:'自己',2:'爸爸',3:'妈妈',4:'其他',5:'爷爷',6:'奶奶',7:'外公',8:'外婆',9:'家长'}
const STUDENT_STATUS_MAP = {
        1:{text:'正常',color:'blue'},
        50:{text:'结课',color:'#adc6ff'},
        20:{text:'停课',color:'green'},
        30:{text:'休学',color:'red'},
        90:{text:'退学',color:'default'},
        100:{text:'封存',color:'yellow'}
}
const CONSUME_TYPE_ARR = [
        {value:1,label:'新报'},
        {value:2,label:'续报'},
        {value:3,label:'扩科'},
        {value:4,label:'物品销售'}
]

const SM_PW = {1:'手机号后六位',2:'123456',3:'888888',4:'666666',5:'其他密码'}
const PROMOTION_RULES = {1:'打折',2:'满减',3:'直减',4:'送课时'}
const GTYPE = {0:'课程',1:'物品',2:'储值',3:'杂费'}

export default {
	filters:{
        gtype(v) {
            return GTYPE[v]
        },
        promotion(v) {
            return PROMOTION_RULES[v]
        },
        sm_pw(v) {
            return SM_PW[v]
        },
        family_rel(id){
            if(typeof FAMILY_REL_MAP[id] != 'undefined'){
                return FAMILY_REL_MAP[id]
            }
            return '未设置'
        },
        s_status(v) {
            return STUDENT_STATUS_MAP[v]['text']
        },
        duration(d) {
            let duration = Number(d)
            let min = Math.floor(duration / 60)
            let sec = Math.round(duration % 60)
            return `${min}′ ${sec}″`
        },
		int_date(day_int){
			day_int = day_int||''
			let s = day_int.toString(),
                t = [],
                l = s.length;
            if (l == 8) {
                t.push(s.substr(0, 4));
                t.push(s.substr(4, 2));
                t.push(s.substr(6, 2));
            } else if (l == 6) {
                for (let i = 0; i < l; i++) {
                    t.push(s.substr(i, 2));
                    i++;
                }
            }
            return t.join('-');
		},
		int_week(day_int){
			let t = ['日', '一', '二', '三', '四', '五', '六'];
            let dt = util.int_day_to_date(day_int);
            return t[dt.getDay()];
		},
        format_int_day(day_str){
            return day_str.toString().replace(/[^\d]+/g,'')
        },
        format_int_hour(hour_str){
            return hour_str.toString().replace(/[^\d]+/g,'')
        },
		int_hour(hour_int){
			hour_int = hour_int||0
			let s = hour_int.toString(),
                t = [],
                l = s.length;
            switch(l){
                case 0:
                    s = '0000';
                    break;
                case 1:
                    s = '000'+s;
                    break;
                case 2:
                    s = '00'+s;
                    break;
                case 3:
                    s = '0'+s;
                    break;
                default:
                    s = s;
            }
            
            for (let i = 0; i < s.length; i++) {
                t.push(s.substr(i, 2));
                i++;
            }
            return t.join(':');
		},
        date(timestamp,format){
            if(timestamp == 0){
                return ''
            }
            let date = timestamp
            format = format || 'YYYY-MM-DD'
            if(/^\d{7,12}$/.test(timestamp)){
                date = new Date((parseInt(timestamp)*1000))
            }
            return moment(date).format(format)
        },
        moment(date,format){
            return moment(date).format(format)
        },
        week_day_text(week_day,prefix){
            let wd = ['一','二','三','四','五','六','天']
            if(!prefix){
                prefix = '周'
            }
            return prefix+wd[week_day-1]
        },
        sex(sex){
            let map = {0:'-',1:'男',2:'女'}
            return map[sex]
        },
        nums_unit(u){
            let map = {0:'',1:'次',2:'课时',3:'月'}
            return map[u]
        },
        //课程类型
        lesson_type(v){
            let map = {0:'班课',1:'1对1',2:'1对多',3:'研学旅行团'}
            return map[v]
        },
        //作业类型
        homework_type(v){
            let map = {0:'课后作业',1:'打卡作业'}
            return map[v]
        },
        //收费模式
        price_type(v) {
            let map = {1:'按课次',2:'按课时',3:'按时间'}
            return map[v]
        },
        date_format(v) {
            return v.toString().replace(/^(\d{4})[-/]?(\d{2})[-/]?(\d{2})$/, "$1-$2-$3")
        },
        season_int_day(v){
            let current_year = (new Date()).getFullYear()
            return v.toString().replace('9999',current_year).replace(/^(\d{4})[-/]?(\d{2})[-/]?(\d{2})$/, "$1-$2-$3")
        },
        lesson_status(v){
            let map = {0:'未开课',1:'正常上课',2:'已结课'}
            return map[v]
        },
        stop_status(v){
            let map = {0:'未停课',1:'已停课'}
            return map[v]
        },
        format_lesson_amount(v){
            return Math.round(parseFloat(v) * 100)/100;
        },
        consume_type(v) {
            let map = {0:'-',1:'新报',2:'续报',3:'扩科',4:'物品销售'}
            let types = store.state.gvars.configs.params.student_signup.consume_types
            types.forEach(item=>{
                if(typeof map[item.value] == 'undefined'){
                    map[item.value] = item.label
                }
            })
            return map[v]
        },
        student_status(v) {
            let map = {1:'正常',20:'停课',30:'休学',90:'退学',100:'封存'}
            return map[v]
        },
        franchisee_status(v) {
            let map = {0:'未选址',1:'筹备期',2:'预售期',3:'正常营业',4:'停业',5:'已解约'}
            return map[v]
        },
        lesson_status_text(v){
            if(v ==2){
                return '已结课'
            }
            return '正常'
        },
        stop_status_text(v){
            if(v == 1){
                return '已停课'
            }
            return '正常'
        },
        amount(v){
            return Number(v).toFixed(2)
        }
	},
    methods: {
        school_name (id) {
            let public_schools_array = this.$store.state.gvars.public_schools,
                school_name = ''
            public_schools_array.forEach(item => {
                if(item.ps_id === id){
                    school_name	= item.school_name
                }
            })
            return school_name
        },
        toString(s){
            return s.toString()
        },
        toInt(s){
            return util.int(s)
        },
    	imgLoadError (e) {
    		e.target.src = this.defaultImg$
    	},
    	$form(name){
    		return new form(name,this)
    	},
        $r(name){
            return this.$refs[name]
        },
    	int_day_to_date (int_day) {
    		return util.int_day_to_date(int_day)
    	},
        dispatch(componentName, eventName, params) {
            let parent = this.$parent || this.$root;
            let name = parent.$options.name;
            while (parent && (!name || name !== componentName)) {
                parent = parent.$parent;

                if (parent) {
                    name = parent.$options.name;
                }
            }
            if (parent) {
                parent.$emit.apply(parent, [eventName].concat(params));
            }
        },
        broadcast(componentName, eventName, params) {
            broadcast.call(this, componentName, eventName, params);
        },
        dr(){
            return this.$store.state.layout.$refs['dr']
        },
        refreshData(url){
            return this.$store.state.layout.$refs['dr'].refreshData(url)
        },       
        labelBranch (bid) {
			let [branchs,result] = [this.$store.state.gvars.branchs,'']
			if(!_.isEmpty(branchs)){
				if(branchs.find(b=>b.bid==bid)){
					result = branchs.find(b=>b.bid==bid).branch_name
				}
			}
			return result
		},
        //获取字典值id:字典id或name，name:字典name
        labelDicts (id,field) {
			let [obj,result] = [this.$store.state.gvars.dicts[field],'']
			if(!_.isEmpty(obj)){
				if(field=='grade'||field=='season'){
					if(result = obj.find(o=>o.name==id)){
						result = obj.find(o=>o.name==id).title						
					}
				}
				
				if(obj.find(o=>o.did===id)){
					result = obj.find(o=>o.did===id).title	
				}					
			}
			return result
		},		
		//获取gvars对应值 obj_name：对象名，idfield：主键名，id：主键值，textfield：取值的字段名
		mapGvarsText(obj_name,idfield,id,textfield) {
			let obj = this.$store.state.gvars[obj_name]
			if(obj&&obj.find(o=>o[idfield]==id)){				
				return obj.find(o=>o[idfield]==id)[textfield]				
			}
			return ''
		},
		mapLabelText (id,map_name) {	            
            return this.$store.getters.getMapText(id,map_name)	            
        },
		getAge (time) {
            return util.age(time)
		},
		dicts (type) {
        	let dicts = this.$store.state.gvars.dicts[type]
        	if(dicts&&dicts.length>0){
        		return dicts
        	}
        	return []
        },
	    yearToDate(year){
            return (new Date()).setFullYear(util.int(year))
        },
        hasPer(per){
            return this.$store.state.user.info.pers.indexOf(per) !== -1
        },
        buildIdMap(list,c){
            let map = {
                classrooms:{id:'cr_id',text:'room_name'}
            }
            this.$store.commit('buildIdTextMap',{
                list:list,
                name:c,
                ifield:map[c].id,
                tfield:map[c].text
            })
        },
        refreshGlobalVar(name){
            this.$store.dispatch('updateGlobalVar',name)
        },
        //bill_type:1：缴费，2：退费
        //id: 收据id/退费id
        //bt: 1: 收据，2：合同
        //preview: 是否预览，默认为true
        print (bill_type,id,bt,preview) {
        	preview = typeof preview == 'undefined' ? true : preview
        	let type = bill_type === 1?'receipt_bill':'refund_bill'
            let api = 'orders/do_print?type='+type+'&number='+id
            if(bill_type == 1 && (typeof bt !== 'undefined') && bt ==2) {
                api += '&bt='+bt
                bill_type = 6
            }
			this.showPageSpin('正在获取打印模板...')
			this.$rest(api).get()
			.success(data=>{
				this.printer.printBill(bill_type,data,1,'0 0 0 0',preview)
				this.hidePageSpin()
			}).error(res=>{
				this.hidePageSpin()
				this.$Notice.error({
					title: '错误',
					desc: res.body.message||'获取打印数据错误'
				})
			})
		},
		picturePreview (src) {
			if(!/$\s*^/.test(src)){
                /*
				this.$store.state.layout.$refs['picturePreview']
				.set('imgSrc',src)
				.show('图片预览','add')
                */
                this.$viewImage(src)
			}			
		},
        confirm(text){
            return new Promise((resolve,reject)=>{
                this.$Modal.confirm({
                    content:text||'您确定要进行删除操作吗?',
                    onOk:()=>{
                        resolve()
                    },
                    onCancel:()=>{
                        reject()
                    }
                })
            })
        },
        error(text,title){
            setTimeout(() => {
                this.$Modal.error({
                    title: title||'操作失败提示',
                    content: text
                })
            },400)
        },
        //全屏加载中组件
        showPageSpin (content) {
        	this.$Spin.show({
                render: (h) => {
                    return h('div', [
                        h('i', {
                            attrs:{
                            	'class': 'mb-3 demo-spin-icon-load ivu-icon ivu-icon-load-c',
                            },         
                            style:{
                            	fontSize: '40px'
                            }
                        }),
                        h('div', content||'正在加载中...')
                    ])
                }
            })
        },
        hidePageSpin () {
        	this.$Spin.hide()
        },
        format_day(int_day){
            if(/^\d{8}$/.test(int_day)){
                return this.$filter('int_date')(int_day)
            }else if(/^\d{4}-\d{2}-\d{2}$/.test(int_day)){
                return int_day
            }
            return ''
        },
        format_hour(int_hour){
            if(/^\d{3,4}$/.test(int_hour)){
                return this.$filter('int_hour')(int_hour)
            }else if(/^\d{2}:\d{2}$/.test(int_hour)){
                return int_hour
            }
            return ''
        },
        get_season_dates(bid,year,season){
            let season_dates = this.$store.state.gvars.season_dates
            let sd = season_dates.find(item=>{
                return item.bid == bid && item.year == year && item.season == season
            })
            if(sd){
                return sd
            }
            sd = season_dates.find(item=>{
                return item.bid == 0 && item.year == year && item.season == season
            })
            if(sd){
                return sd
            }
            sd = season_dates.find(item=>{
                return item.bid == 0 && item.year == 0 && item.season == season
            })
            return sd
        },
        get_season_by_date(dt){
            let int_day_start,int_day_end
            let year = dt.getFullYear()
            let bid  = this.bid$
            let int_day = util.int(moment(dt).format('YYYYMMDD'))
			
            let seasons = ['C','S','Q','H','A']
            let sd,season,result = 'A'
            //按照CSQH顺序依次来查
            function year_replace(day,year){
                return day.replace('9999',year.toString())
            }
            
            for(let i=0;i<4;i++){
                season = seasons[i]
                sd = this.get_season_dates(bid,year,season)
                if(sd){
                    int_day_start = util.int(this.$filter('format_int_day')(year_replace(sd.int_day_start,year)))
                    int_day_end   = util.int(this.$filter('format_int_day')(year_replace(sd.int_day_end,year)))
                    if(int_day_start > int_day_end){
                        int_day_end = util.int_day_add_year(int_day_end,1)
                    }
                    if(int_day_start <= int_day && int_day_end >= int_day){
                        result = season
                        break;
                    }
                }
            }

            return result
        },
        get_time_sections(week_day,season){
            let bid = this.bid$
            let time_sections = this.$store.state.gvars.time_sections
            let ts
            ts = time_sections.filter(item=>{
                return item.bid == bid && item.season == season && item.week_day == week_day
            })
            if(ts && ts.length > 0){
                return ts
            }
            ts = time_sections.filter(item=>{
                return item.bid == 0 && item.season == season && item.week_day == week_day
            })

            return ts
        },
        exportExcel (file_name,arg) {				
        	table2excel.transform(this.$refs['tableExcel'], 'hrefToExportTable', file_name,arg);
        },
        isBefore(date1,date2){
        	return moment(date1).isBefore(date2)
        },
        isHoliday(dt){
            let result = false
            let holidays = this.$store.state.gvars.holidays;
            let date = moment(dt).format('YYYY-MM-DD')
            let bid = this.bid$
            let days = holidays.filter(item=>item.int_day == date && item.bid == bid)
            if(days.length == 0){
                days = holidays.filter(item=>item.int_day == date && item.bid == 0)
            }
            if(days && days.length > 0){
                result = true
            }   
            return result
        },
        holidayReason(dt){
            let name = ''
            let holidays = this.$store.state.gvars.holidays;
            let date = moment(dt).format('YYYY-MM-DD')
            let bid = this.bid$
            let days = holidays.filter(item=>item.int_day == date && item.bid == bid)
            if(days.length == 0){
                days = holidays.filter(item=>item.int_day == date && item.bid == 0)
            }
            if(days && days.length > 0){
                name = days[0].name
            }
            return name
        },
        transformDate(res) {
            for(let key in res) {
                if(_.isArray(res[key])) {
                    res[key].forEach(item => {
                        if(item.day) {
                            item.day = moment(item.day).format('MM/DD')
                        }
                    })
                }
            }
            return res
        },
        gvars (type) {
        	let gvars = this.$store.state.gvars
        	return gvars[type]||[]
        },
        replaceFileImage(item) {
            const suffixs = ['txt','doc','pdf','rar','zip','xls','ppt']
            let type = item.file_type
            if(type === 'pptx') {
                type = 'ppt'
            }
            if(type === 'docx') {
                type ='doc'
            }
            if(type === 'xlsx') {
                type = 'xls'
            }
            if(suffixs.indexOf(type) > -1) {
                return `http://sp1.xiao360.com/static/file/icon/${type}.png?imageView2/3/w/63/h/63`
            }else{
                return `http://sp1.xiao360.com/static/file/icon/default.png?imageView2/3/w/63/h/63`
            }
        },
        convertImageToCanvas (image) {
		    var canvas = document.createElement("canvas");
		    canvas.width = image.width;
		    canvas.height = image.height;
		    canvas.getContext("2d").drawImage(image, 0, 0, image.width, image.height);
		    return canvas;
		},
        isEF(field,table){      //is enable field
            try{
                let key = table+'_disable_fields'
                let disable_fields = this.$store.state.gvars.configs[key]
                if(disable_fields.indexOf(field) === -1){
                    return true
                }
            }catch(e){
                return true
            }
            return false
        },
        isMF(field,table){      //is must field
            try{
                let key = table+'_must_fields'
                let must_fields = this.$store.state.gvars.configs[key]
                if(must_fields.indexOf(field) !== -1){
                    return true
                }
            }catch(e){
                return false
            }
            return false
        },
        initDisableFieldCloumns(table){
            try{
                let dfs = this.$store.state.gvars.configs[table+'_disable_fields']
                if(dfs.length == 0){
                    return
                }
                for(let i= 0;i<dfs.length;i++){
                    delete this.column_keys[dfs[i]]
                }
            }catch(e){

            }
        },
        getCacheKey(key){
            return key+this.$store.state.user.info.uid
        },
        getCache(key){
            let v =  this.$localStorage.get(this.getCacheKey(key))
            if(v !== null){
                try{
                    if(/^[\{\[].*[\]\}]$/.test(v)){
                        v = JSON.parse(v)
                    }
                }catch(e){

                }
            }
            return v
        },
        setCache(key,value){
            let v = value
            if(typeof value == 'object' || typeof value == 'array'){
             v = JSON.stringify(value)
            }
            this.$localStorage.set(this.getCacheKey(key),v)
        },
        jsleft(lefts,leftn)
        {
            var sl = lefts
            sl = sl.substring(0,leftn)
            return sl
        },
        jsright(rights,rightn)
        {
            var sr=rights
            sr = sr.substring(sr.length-rightn,sr.length)
            return sr
        }
    },
    computed:{
        ptpls(){
            let tpls = [
                {
                    title:'缴费收据模板',
                    name:'pay',
                    bill_type:1,
                    allow_format:[1,2,3],
                    default_format:1
                },
                {
                    title:'缴费合同模板',
                    name:'contract',
                    bill_type:6,
                    allow_format:[1],
                    default_format:1
                },
                {
                    title:'INVOICE模板',
                    name:'invoice',
                    bill_type:7,
                    allow_format:[1],
                    default_format:1
                },
                {
                    title:'退费模板',
                    name:'refund',
                    bill_type:2,
                    allow_format:[1,2,3],
                    default_format:1
                },
                {
                    title:'刷卡小票',
                    name:'attendance',
                    bill_type:3,
                    allow_format:[2],
                    default_format:2
                },
                {
                    title:'预充值合同',
                    name:'pre_charge',
                    bill_type:4,
                    allow_format:[1],
                    default_format:1
                },
                {
                    title:'报名课表',
                    name:'order_lesson',
                    bill_type:5,
                    allow_format:[1],
                    default_format:1
                }
            ]
            if(!this.enable_invoice_print){
				tpls.splice(2,1)
            }
            return tpls
        },
        map_print_tpl(){
            let map = {}
            this.ptpls.forEach(item=>{
                map[item.bill_type] = item.title
            })
            return map
        },
        map_lesson_type(){
            return { 0:'班课',1:'一对一',2:'一对多',3:'研学旅行团' }
        },
        enable_lesson_types(){
            let types = []
            let enable_types = this.$store.state.gvars.configs.params.lesson.enable_lesson_type
            
            for(let o in this.map_lesson_type){
                let lesson_type = Number(o)
                if(enable_types.indexOf(lesson_type) !== -1){
                    types.push({
                        label:this.map_lesson_type[o],
                        value:lesson_type
                    })
                    
                }
            }
            return types
        },
        enable_lesson_type(){
            this.$store.state.gvars.configs.params.lesson.enable_lesson_type
        },
        weekdays(){
            return [
                {value:1,label:'周一'},
                {value:2,label:'周二'},
                {value:3,label:'周三'},
                {value:4,label:'周四'},
                {value:5,label:'周五'},
                {value:6,label:'周六'},
                {value:7,label:'周日'}
            ]
        },
        expire_condition(){
            return [
                {
                    field:'',
                    label:'不限'
                },
                {
                    field: 'ex',
                    label: '已经到期'
                },
                {
                    field: '1w',
                    label: '一周内到期'
                },
                {
                    field: '1m',
                    label: '一月内到期'
                },
                {
                    field: '2m',
                    label: '两月内到期'
                }
            ]
        },
        gtype_map() {
            return GTYPE
        },
        promotion_type_list() {
            return PROMOTION_RULES
        },
        sm_pw_map() {
            return SM_PW
        },
        rel_list(){
            return FAMILY_REL_MAP
        },
        consume_type_list() {
            let list = this.consume_types
            list.push({
                value:4,
                label:'物品销售'
            })
            return list
        },
        ss_map(){
            return STUDENT_STATUS_MAP
        },
    	is_orgs () {
    		//og_id大于0则是加盟商
    		return this.og_id$ > 0
    	},
    	og_id$ () {
    		return this.$store.state.user.info.og_id||0
    	},
        org_fc_id () {
            let org = this.$store.state.user.info.org
            if(org&&org.fc_id) {
                return org.fc_id
            }
            return 0
        },
        org_type () {
            let org = this.$store.state.user.info.org
            if(org&&org.org_type) {
                return org.org_type
            }
            return 1
        },
        showGetScope () {
            let client = this.$store.state.client
            return client.og_id == 0 && client.is_org_open == 1
        },
        is_head_org() {
            let client = this.$store.state.client
            return client.og_id == 0 && client.is_org_open == 1
        },
        label_currency(){
            return this.$store.state.gvars.configs.params.currency_symbol
        },
        label_cc(){
            return this.$filter('translate')('咨询师')
        },
        label_teacher(){
            return this.$filter('translate')('老师')
        },
        label_eduer(){
            return this.$filter('translate')('学管师')
        },
        label_secteacher(){
            return this.$filter('translate')('助教')
        },
        label_sale() {
            return this.$filter('translate')('渠道销售')
        },
        label_service() {
            return this.$filter('translate')('督导')
        },
        label_teach_teacher(){
            return '授课'+this.$filter('translate')('老师')
        },
        label_filter_teacher(){
            return '输入'+this.$filter('translate')('老师')+'姓名过滤'
        },
        label_choose_teacher(){
            return '请选择'+this.$filter('translate')('老师')
        },
        label_count_teacher(){
            return '按'+this.$filter('translate')('老师')+'汇总'
        },
        label_teacher_terminal(){
            return this.$filter('translate')('老师')+'端'
        },
        label_teacher_class(){
            return this.$filter('translate')('老师')+'带班统计'
        },
        label_teacher_performance(){
            return this.$filter('translate')('老师')+'业绩汇总'
        },
        trial_times () {
            let map = [],
                week_days = ['周一','周二','周三','周四','周五','周六','周日'],
                sections = ['上午','下午','晚上']
            for(let i=0,len=week_days.length;i<len;i++) {
                for(let j=0,len=sections.length;j<len;j++) {
                    let item = week_days[i] + sections[j]
                    map.push({
                        value: (i+1).toString()+(j+1).toString(),
                        label: item
                    })
                }
            }
            return map
        },
        userPers() {
            return this.$store.state.user.info.pers
        },
        perCheckAllStudent() {
            return this.userPers.indexOf('student.checkAll') > -1 ? true : false
        },
        perCheckAllClass() {
            return this.userPers.indexOf('class.checkAll') > -1 ? true : false
        },
        perCheckAllArrange() {
            return this.userPers.indexOf('arrange.checkAll') > -1 ?true : false
        },
        myStudentApi() {
            return util.sprintf('employees/%s/students?class=1',this.eid$)
        },
        myClassApi() {
            return 'classes?my=true&with=schedules&teach_eid='+this.eid$
        },
    	defaultImg$ () {
    		return 'http://s1.xiao360.com/common_img/avatar.jpg'
    	},
        org_name(){
            return this.$store.state.gvars.configs.params.org_name
        },
        printer(){
            return this.$store.state.layout.$refs['printer']
        },
        print_preview () {
        	  return this.$store.state.layout.$refs['print_preview']
        },
        xupload(){
        	return this.$store.state.layout.$refs['xupload']
        },
        webcall () {
        	return this.$store.state.layout.$refs['webcall']
        },
        chatbox () {
            return this.$store.state.layout.$refs['chatbox']
        },
        eid$ () {
        	if(!_.isEmpty(this.$store.state.user.info.employee)){
        		return this.$store.state.user.info.employee.eid
        	}
   			return 0
   		},   		
        uid$ () {
        	if(!_.isEmpty(this.$store.state.user.info)){
        		return this.$store.state.user.info.uid
        	}
   			return 0
   		},
        bids_user () {
        	if(!_.isEmpty(this.$store.state.user.info.employee)){
        		return this.$store.state.user.info.employee.bids
        	}
            return []
        },
        user_pj_ids() {
            if(!_.isEmpty(this.$store.state.user.info.employee)){
                return this.$store.state.user.info.employee.pj_ids
            }
            return []
        },
        user_charge_pj_ids() {
            if(!_.isEmpty(this.$store.state.user.info.employee)){
                return this.$store.state.user.info.employee.charge_pj_ids || []
            }
            return []
        },
        //归属校区
        bid_user () {
            if(!_.isEmpty(this.$store.state.user.info.employee)){
                return this.$store.state.user.info.employee.bid
            }
            return 0
        },
        rids_user () {
            if(!_.isEmpty(this.$store.state.user.info.employee)){
                return this.$store.state.user.info.employee.rids
            }
            return []
        },
        sub_eids() {
            let employee = this.$store.state.user.info.employee
            if(!_.isEmpty(employee)&&employee.sub_eids){
                return employee.sub_eids
            }
            return []
        },
        sale_roles(){           
            return this.$store.state.gvars.dicts.sale_role
        },
        //gm 类似游戏 game manager 后台管理员
        is_gm(){
            return this.$store.state.user.info.allow_add_help == 1
        },
        is_admin () {
            return this.$store.state.user.info.is_admin === 1
        },
        bid$(){
            return this.$store.state.branch.id
        },
        bids$(){
            return this.$store.state.branch.ids
        },
        accounts$() {
            return this.$store.state.gvars.accounts
        },
        cut$() {
            return this.$store.state.gvars.dicts['cutamount']
        },
        saving(){
            return this.$store.state.http.saving
        },
        current_year(){
            return (new Date()).getFullYear()
        },
        is_sdb_open() {
            return this.$store.state.user.info.client.func_sdb_open
        },
        is_app_chat_open(){
            return this.$store.state.user.info.client.func_app_chat_open
        },
        consume_types(){
            let default_consume_types = [
                {value:1,label:'新报'},
                {value:2,label:'续报'},
                {value:3,label:'扩科'},
            ]
            let ret = null
            try{
                if(this.$store.state.gvars.configs.params.student_signup.consume_types){
                    ret = this.$store.state.gvars.configs.params.student_signup.consume_types.filter(item=>{
                        return item.enable == 1
                    })
                }
            }catch(e){
                ret = default_consume_types
            }
            return ret || default_consume_types
        },
        ueconfig(){
            return {
                toolbars: [
                    ['simpleupload', 
                    'insertimage', 
                    'link', 
                    'spechars', 
                    'justifyleft', 
                    'justifyright', 
                    'justifycenter', 
                    'justifyjustify', 
                    'undo', 
                    'redo', 
                    'bold']
                ],
                elementPathEnabled: false,
                wordCount: false,           
                initialFrameHeight: 400,
                initialFrameWidth: 680,
                imagePathFormat: '/upload',
                enableAutoSave: false,
                autoHeightEnabled: true
            }
        },
        department_tree(){
            let org_name = this.$store.state.gvars.configs.params.org_name
            let department_list = util.copy(this.$store.state.gvars.departments)
            let tree = []
            let rootNode = {
                pid:0,
                dpt_id:'0',
                bid:0,
                dpt_type:'org',
                dpt_name:org_name,
                children:[],
                opened:true,
                icon:'ivu-icon ivu-icon-ios-people'
            }
            department_list.forEach(item=>{
                item.id = item.dpt_id
                if(item.dpt_type == 1){
                    item.icon = 'ivu-icon ivu-icon-ios-home'
                }else if(item.dpt_type == 2){
                    item.icon = 'ivu-icon ivu-icon-location'
                }else{
                    item.icon = 'ivu-icon ivu-icon-network'
                }
            })
            rootNode.children = util.list_to_tree(department_list,'dpt_id','pid')
            tree.push(rootNode)
            return tree
        },
        branch_params(){
            var gvars = this.$store.state.gvars;
            if(gvars.bconfigs.params[this.bid$]) {
                return gvars.bconfigs.params[this.bid$];
            }
            else {
                return gvars.configs.params;
            }
        },
        enable_lesson_type0(){
            return this.$store.state.gvars.configs.params.lesson.enable_lesson_type.indexOf(0) !== -1
        },
        enable_lesson_type1(){
            return this.$store.state.gvars.configs.params.lesson.enable_lesson_type.indexOf(1) !== -1
        },
        enable_lesson_type2(){
            return this.$store.state.gvars.configs.params.lesson.enable_lesson_type.indexOf(2) !== -1
        },
        enable_lesson_type3(){
            return this.$store.state.gvars.configs.params.lesson.enable_lesson_type.indexOf(3) !== -1
        },
        enable_grade(){
            return this.$store.state.gvars.configs.params.enable_grade
        },
        class_must_sel_lesson(){
            return this.$store.state.gvars.configs.params.class_must_sel_lesson
        },
		enable_money_consume(){
			let result = 0
			
			if(this.$store.state.gvars.configs.params.class_attendance){
				result = this.$store.state.gvars.configs.params.class_attendance.enable_money_consume
			}
			return result
		},
        enable_lesson_ability(){
            return this.$store.state.gvars.configs.params.enable_lesson_ability
        },
        enable_company() {
            return this.$store.state.gvars.configs.params.enable_company
        },
        enable_online_lesson() {
            return this.$store.state.gvars.configs.params.enable_online_lesson
        },
        enable_vip() {
            return this.$store.state.gvars.configs.params.member.enable
        },
        enable_teacher_level(){
            return this.$store.state.gvars.configs.params.teacher_level.enable
        },
        enable_service_level() {
            return this.$store.state.gvars.configs.params.service.enable_level
        },
        enable_debit_card(){
            return this.branch_params.student_signup.enable_debit_card
        },
        enable_debit(){
            return this.branch_params.student_signup.enable_debit
        },
        
        service_level_config() {
            return this.$store.state.gvars.configs.params.service.max_level
        },
        vip_level_config () {
            return this.$store.state.gvars.configs.params.member.level
        },
        theme() {
            return this.$store.state.app.theme
        },
        theme_color() {
            if(this.theme === 'theme-default' || this.theme === 'theme-light') {
                return '#39f'
            }else{
                return this.$store.state.app.color
            }
        },
        enable_extra_consume() {
            return this.$store.state.gvars.configs.params.class_attendance.enable_extra_consume == 1
        },
        enable_user_contract_no() {
            return this.branch_params.student_signup.enable_user_contract_no
        },
        enable_user_receipt_no() {
            return this.branch_params.student_signup.enable_user_receipt_no
        },
        allow_reg_history() {
            return this.branch_params.class_attendance.allow_reg_history
        },
        allow_del_history() {
            return this.branch_params.class_attendance.allow_del_history
        },
        reg_history_pass_days() {
            return this.branch_params.class_attendance.reg_history_pass_days
        },
        reg_history_pass_months() {
        	return this.branch_params.class_attendance.reg_history_pass_months
        },
        regatt_default_consume() {
            return this.$store.state.gvars.configs.params.student_leave.regatt_default_consume
        },
        del_history_pass_days() {
            return this.branch_params.class_attendance.del_history_pass_days
        },
        del_history_pass_months() {
        	return this.branch_params.class_attendance.del_history_pass_months
        },
        print_bill_type() {
            return this.branch_params.student_signup.print_bill_type
        },
        map_history_pass_months() {
        	return { 0:'不限制', 1:'本月', 2:'本月及上个月', 3:'本月及前3个月' }
        },
        enable_tbs() {
            return this.$store.state.gvars.configs.params.course_arrange.enable_tbs
        },
        must_input_expire_day() {
            return this.$store.state.gvars.configs.params.must_input_expire_day
        },
        enable_bk() {
            return this.$store.state.gvars.configs.params.course_arrange.is_bk_open
        },
        lesson_warn_nums() {
            return this.$store.state.gvars.configs.params.lesson_warn_nums
        },
	    allow_different_lesson_makeup(){
            return this.$store.state.gvars.configs.params.student_makeup.allow_different_lesson
        },
        teacher_levels() {
                return this.$store.state.gvars.configs.params.teacher_level.level
        },
        enable_empty_refund(){
            return this.$store.state.gvars.configs.params.student_refund.enable_empty_refund
        },
        is_common_subject () {
            return this.$store.state.gvars.configs.params.class_attendance.sl_bcu_subject
        },
        enable_type2_bk () {
            return this.$store.state.gvars.configs.params.xxgj.enable_type2_bk
        },
        enable_tally_check() {
            return this.$store.state.gvars.configs.params.iae.enable_tally_check
        },
        enable_attendance_check() {
            return this.$store.state.gvars.configs.params.class_attendance.enable_attendance_check
        },
        showSwitchTpl() {
            return this.$store.state.gvars.configs.params.service.enable_free_review_style
        },
        enable_er_lesson_hour() {
            return this.$store.state.gvars.configs.params.iae.enable_er_lesson_hour
        },
        allow_empty_teachobj() {
            return this.$store.state.gvars.configs.params.course_arrange.allow_empty_teachobj
        },
        need_lha() {
            return this.$store.state.gvars.configs.params.student_signup.need_lha
        },
        enable_invoice_print(){
            return this.$store.state.gvars.configs.params.student_signup.enable_invoice_print
        },
        enable_classroom_live(){
            return this.$store.state.gvars.configs.params.xxgj.enable_classroom_live
        },
        enable_material_bid(){
            return this.$store.state.gvars.configs.params.app.enable_material_bid
        },
        enable_arrange_status(){
            return this.$store.state.gvars.configs.params.course_arrange.enable_arrange_status
        },
        enable_time_section(){
            return this.$store.state.gvars.configs.params.course_arrange.enable_time_section
        },
        allow_modify_consume_hour(){
            return this.$store.state.gvars.configs.params.class_attendance.allow_modify_consume_hour
        },
        enable_modify_saved_order(){
            return this.$store.state.gvars.configs.params.student_signup.enable_modify_saved_order
        },
        enable_project() {
            return this.$store.state.gvars.configs.params.enable_project
        },
        teacher_times_warn() {
            return this.$store.state.gvars.configs.params.dashboard.arrange_warn_policy == 1
        },
        allow_debt_att() {
            return this.$store.state.gvars.configs.params.class_attendance.allow_debt_att
        },
        enable_free_attendance() {
            return this.$store.state.gvars.configs.params.class_attendance.enable_free_attendance
        },
        enable_lesson_name () {
            return this.$store.state.gvars.configs.params.xxgj.class_show_lesson_name
        }, 
        select_teacher_limit(){
            return this.$store.state.gvars.configs.params.course_arrange.select_teacher_limit?true:false
        },
        enable_modify_rap() {
            return this.$store.state.gvars.configs.params.service.enable_modify_rap
        },
        enable_qrcode_attendance() {
            return this.$store.state.gvars.configs.params.class_attendance.enable_qrcode_attendance
        },
	enable_multi_eid () {
            return this.$store.state.gvars.configs.params.service.enable_multi_eid
        },
        enable_homework_task_tpl() {
            return this.$store.state.gvars.configs.params.service.enable_homework_task_tpl
        },
        show_expire_day() {
            return this.$store.state.gvars.configs.params.class_attendance.show_expire_day
        },
        perCheckAllFlow() {
            return this.userPers.indexOf('flow.all') > -1 ? true : false
        },
	    transfer_limit_lesson() {
            return this.$store.state.gvars.configs.params.class.transfer_limit_lesson
        },
        show_sl_expire_warn() {
            return this.$store.state.gvars.configs.params.dashboard.show_sl_expire_warn
        },  
        perCheckAllServiceWeek() {
            return this.userPers.indexOf('service_week.all') > -1 ? true : false
        },
        enable_contract_print() {
            return this.$store.state.gvars.configs.params.student_signup.enable_contract_print
        },
        enable_regular_homework() {
            return this.$store.state.gvars.configs.params.service.enable_regular_homework
        },
        allow_empty_cc() {
            return this.$store.state.gvars.configs.params.course_arrange.allow_empty_cc
        },
        allow_cu_add() {
            return this.$store.state.gvars.configs.params.customer.allow_cu_add
        },
        required_school_grade_from() {
            return this.$store.state.gvars.configs.params.customer.required_school_grade_from
        },
        show_student_grade() {
            return this.$store.state.gvars.configs.params.course_arrange.show_student_grade
        },
        class_attendance_list_mode() {
            return this.$store.state.gvars.configs.params.class_attendance.list_mode
        },
        enable_order_check(){
            return this.$store.state.gvars.configs.params.iae.enable_order_check
        },
        enable_orb_check(){
            return this.$store.state.gvars.configs.params.iae.enable_orb_check
        },
        forbid_uncheck_arrange(){
            return this.$store.state.gvars.configs.params.iae.forbid_uncheck_arrange
        },
        forbid_uncheck_assign(){
            return this.$store.state.gvars.configs.params.iae.forbid_uncheck_assign
        }
    }
}