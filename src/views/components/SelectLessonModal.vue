<template>
    <Modal v-drag-modal v-model="modal$.show" :mask-closable="true" :width="width" :title="title" @on-cancel="closeModal">
    	<div :class="classes">
    		<div class="list-main">
                <div class="list-condition">
            		<Row :gutter="8">
                		<Col span="8">
                			<Select placeholder="课程级别" v-model="condition.product_level_did" size="small" @on-change="search">
		                   		<Option :value="0">不限课程级别</Option>
								<Option v-for="(item,index) in product_levels" :key="index" :value="item.did">{{item.title}}</Option>
							</Select>
                		</Col>
                		<Col span="8">
                			<Select placeholder="科目" v-model="condition.sj_ids" :clearable="true" size="small" @on-change="search">
								<Option value="">不限科目</Option>
	                            <Option v-for="(item,index) in subjects" :key="index" :value="item.sj_id">{{item.subject_name}}</Option>
	                        </Select>
                		</Col>
                		<Col span="8">
                			<Select placeholder="期段" v-model="condition.season" :clearable="true" size="small" @on-change="search">
                				<Option value="">不限期段</Option>
		                        <Option v-for="(item,index) in dicts('season')" :key="index" :value="item.name">{{item.title}}</Option>
		                    </Select>
                		</Col>
                	</Row>
                	<Row :gutter="8" class="mt-3">
                		<Col span="8">
                			<Input 
                                v-model="search_field.lesson_name" 
                                size="small" 
                                placeholder="课程名称" 
                                v-focusme="'searchkey'" 
                                @keyup.native.enter="search">
                            </Input>
                		</Col>
                		<Col span="16">
                			<ButtonGroup>
                				<Button type="primary" icon="ios-search" @click="search" size="small">查询</Button>
                				<Button type="primary" :icon="toggleSearchIcon" @click="toggleSearch" size="small"></Button>
                			</ButtonGroup>
                            <Button type="primary" icon="refresh" @click="resetSearch" size="small">重置</Button>
                            <CheckboxGroup 
                            v-model="condition.lesson_type" 
                            @on-change="changeLessonType" 
                            style="display: inline-block;" 
                            class="ml-3">

                            	<Checkbox 
                                :disabled="allowType.length == 1" 
                                :label="item.value" 
                                v-if="allowType.indexOf(item.value) !== -1"
                                v-for="(item,index) in enable_lesson_types"
                                :key="index"
                                >
                                {{item.label}}
                                </Checkbox>
                                <!--
                            	<Checkbox :disabled="allowType.length == 1" :label="1" v-if="allowType.indexOf(1) !== -1">一对一</Checkbox>
                            	<Checkbox :disabled="allowType.length == 1" :label="2" v-if="allowType.indexOf(2) !== -1">一对多</Checkbox>
                                -->
                            </CheckboxGroup>
                            <span>|</span>
                            <Checkbox class="ml-2" v-model="is_demo" :disabled="isDemoExtra">体验课</Checkbox>
                		</Col>
                	</Row>
                    <!-- 年份筛选 -->
                    <div class="mt-1" v-if="searchExpand">
                		<Select 
	                		v-model="condition.year"
	                		size="small" 
	                		placeholder="年份"
	                		clearable
	                		style="width:200px;display: inline-block;"
                            @on-change="search">
            				<Option :value="0">不限年份</Option>
            				<Option v-for="(item,index) in years" :key="index" :value="item">{{item}}</Option>
            			</Select>
                    </div>
                </div>
                <div class="list-body">
                    <div class="list-body-wrap" v-loading.like="'lessons'">
                        <table class="modal-table">
                            <thead>
                                <tr>
                                    <th width="50" v-if="multiple">
                                    	<div class="ivu-table-cell">
                                        	<Checkbox v-model="checkAll" @click.native="handleCheckAll"></Checkbox>
                                        </div>
                                    </th>
                                    <th><div class="ivu-table-cell">课程</div></th>
                                    <th><div class="ivu-table-cell">授课</div></th>
                                    <th><div class="ivu-table-cell">收费</div></th>
                                    <th width="75"><div class="ivu-table-cell">等级</div></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr 
                                :class="{'table-info':item.$selected}" 
                                @click="toggleSelected(item)" 
                                v-for="(item,index) in data"
                                :key="index"
                                >
                                    <td v-if="multiple">
                                        <div class="ivu-table-cell"><Checkbox v-model="item.$selected"></Checkbox></div>
                                    </td>
                                    <td><div class="ivu-table-cell">{{item.lesson_name}}</div></td>
                                    <td>
                                        <div class="ivu-table-cell">
                                            <p>{{item.lesson_type|lesson_type}}</p>
                                            <template v-if="item.price_type !== 3">
                                                <p>单次课时长:{{item.unit_lesson_minutes}}分钟</p>
                                                <p>每次课消耗:{{item.unit_lesson_hours}}课时</p>
                                            </template>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="ivu-table-cell">
                                            <div v-html="change(item)"></div>
                                            <Tooltip v-if="item.define_promotion_rule.length>0">
                                                <p class="text-info">有{{item.define_promotion_rule.length}}个优惠</p>
                                                <div slot="content">
                                                    <p v-for="(r,index2) in item.define_promotion_rule" :key="index2">{{r.title}}</p>
                                                </div>
                                            </Tooltip>
                                            <Tooltip v-if="item.step_price_define && item.step_price_define.length > 0">
                                                <p class="text-info">有{{item.step_price_define.length}}个阶梯定价</p>
                                                <div slot="content">
                                                    <p v-for="(r,index3) in item.step_price_define" :key="index3">
                                                        {{r.start}}~{{r.end}}个课时,单价:{{r.price}}
                                                    </p>
                                                </div>
                                            </Tooltip>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="ivu-table-cell">{{item.product_level_did|dict_title('product_level')}}</div>
                                    </td>
                                </tr>
                                <tr v-if="data.length == 0">
                                    <td colspan="5" style="text-align: center"><p class="empty">没有合适的课程</p></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="list-page clearfix">
                        <Page class="pull-right" size="small" :total="total" :show-total="true" :current="pageIndex" :show-sizer="true" :page-size="pageSize" @on-change="pagenation" @on-page-size-change="pagesize"></Page>
                    </div>
                    
                </div>
            </div>
            <div class="multi-selected" v-if="this.multiple">
                <Card>
                    <div style="display: flex; align-items: center" slot="title">
                        <span style="flex: 0 0 190px">已选择:<span class="badge">{{selectedTotal}}</span></span>
                        <Button @click="clearSelectedId" class="pull-right" type="ghost" shape="circle" size="small" icon="trash-a" title="清空"></Button>
                    </div>
                    <ul class="multi-selected-list">
                        <li style="display: flex; align-items: center" v-for="(item,index) in selectedList" :key="index">
                            <span style="flex: 0 0 190px">{{item.lesson_name}}</span>
                            <Button @click="cancelSelectedId(item)" class="pull-right" type="ghost" shape="circle" size="small" icon="trash-a" title="移除"></Button>
                        </li>
                    </ul>
                </Card>
            </div>
    	</div>
        <div slot="footer">
            <span class="footer-selected pull-left" v-if="!multiple"><i>已选择:</i>{{labelText}}</span>
            <Button type="default" @click="cancel">取消</Button>
            <Button type="primary" @click="ok">确定</Button>
        </div>
    </Modal>
</template>
<script>
import util from '@/libs/util'
import modal from '@/libs/modal.mixin'
import grid from '@/libs/grid.mixin'
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import directive from '@/libs/directive.mixin'

const emptyCondition = {
	lesson_type: [],
    season: '',
    sj_ids: 0,
    product_level_did: 0,
    year: ''
}

const prefixCls = 'select-list';
const resName   = 'lesson'
const idField   = 'lid'
const textField = 'lesson_name'

const gvarName  = 'lessons'
export default {
	name:'LessonList',
    mixins: [common,directive,globals,grid,modal],
    props:{
        value: {
            type: Boolean,
            default: false
        },
        width:{
            type:String,
            default:'640'
        },
        title:{
            type:String,
            default:'选择课程'
        },
        condition:{
            type:Object,
            default(){
                return util.copy(emptyCondition)
            }
        },
        allowType:{
            type:Array,
            default(){
                return [0,1,2]
            }
        },
        multiple: {
            type: Boolean,
            default: false
        },
        selected:{
            type:[Array,Number,String],
            default(){
                return []
            }
        },
        isDemoExtra:{
            type:Boolean,
            default:false
        }
    },
    data() {
        return {
            rest_api: 'lessons',
            pk: 'lid',
            selIds: [],
            search_field: {
                lesson_name: ''
            },
            is_demo:this.isDemoExtra,
            checkAll: false,
            is_data_init:false
        }
    },
    watch: {
        isDemoExtra(v) {
            this.is_demo = v
        }
    },
    computed:{
        classes () {
            return [
                `${prefixCls}`,
                {
                    [`${prefixCls}-multiple`]: this.multiple,
                    [`${prefixCls}-single`]: !this.multiple
                }
            ];
        },
        subjects(){
			return this.gvars('subjects')
		},
		product_levels(){
			return this.$store.state.gvars.dicts.product_level
		},
        selectedTotal(){
            if(this.selIds[0] != 0){
                return this.selIds.length 
            }
            return 0  
        },
        // 获取年份列表
        years() {
				let now = (new Date()).getFullYear()
				return [now+2, now+1, now, now-2, now-1]
			},
        selectedList(){
            let list = []
            this.selIds.forEach(id=>{
                if(id > 0){
                    list.push(this.$store.getters.getMapObject(id,resName))
                }
            })
            return list
        },
        labelText(){
            if(this.selIds.length > 0){
                return this.$store.getters.getMapText(this.selIds[0],resName)
            }
            return ''
        }
    },
    methods: {
    	resetSearch () {
    		this.condition.season = ''
            this.condition.sj_ids = 0
            this.condition.product_level_did = 0
            this.condition.year = ''                        
            this.search_field.lesson_name = ''
            this.searchExpand = false
            if(!this.isDemoExtra) {
                this.is_demo = false
            }
    		this.search()
    	},
        ok(){
            if(!this.selectedTotal){
                this.$Message.error('没有选中任何课程')
                return
            }
            if(this.multiple){
                this.$emit('on-select',this.selectedList)
            }else{
                let row = this.$store.getters.getMapObject(this.selIds[0],resName)
                this.$emit('on-select',row)
            }
            this.$emit('input',false)
            this.close()
        },
        hook_get_param(params) {
            let condition = util.copy(this.condition)
            for(let o in condition) {
                let property = condition[o]
                if(o=='lesson_type') {
                    if(property!=','&&property.length>0) {
                        params[o] = util.sprintf('[in,%s]',property.join(','))
                    }
                }else{
                    if(property&&property!=-1) {
                        params[o] = property
                    }
                }
            }
            if(this.search_field.lesson_name !== '') {
                params.lesson_name = this.search_field.lesson_name
            }
            params.status = 1 // 启用
            params.is_demo = this.is_demo ? 1 : 0 // 体验课反选
            // params.bids = this.bid$
        },
        changeLessonType() {
            this.init_data()
        },
        change(item) {
            let unit_map = ['期','次','课时','月'],
            	unit_type = item.is_term?0:item.price_type,
            	unit = unit_map[unit_type],
            	text = util.sprintf("按%s收费,%s元/%s",unit,item.sale_price,unit),
            	c = [],
            	unit_price = item.unit_price
            c.push(`<p>${text}</p>`)
            if(item.is_term){
                unit = unit_map[item.price_type]
                let term_text = util.sprintf("共%s%s,单价:%s元/%s",item.lesson_nums,unit,unit_price,unit)
                c.push(`<p>${term_text}</p>`)
            }
            return c.join('')
        },
        clearSelectedId(){
            this.selIds.splice(0,this.selIds.length)
            this.refreshData(this.data)
        },
        cancelSelectedId(item){
            let index = this.selIds.indexOf(item[idField])
            if(index !== -1){
                this.selIds.splice(index,1)
                this.refreshData(this.data)
            }
        },
        deal_data(data){
            if(data.list.length > 0){
                this.$store.commit('buildIdTextMap',{
                   list:data.list,
                   name:resName,
                   ifield:idField,
                   tfield:textField
                })
                this.refreshData(data.list)
            }else{
                if(this.multiple && this.checkAll) {
                    this.checkAll = false
                }
            }
            data.list.forEach(item => {
                item = this.setPriceByDefine(item)
            })
            return data.list
        },
        setPriceByDefine(lesson) {
            let define = Number(lesson.define_price)
            if(define > 0) {
                if(lesson.is_term == 1) {
                    lesson.sale_price = define
                    lesson.unit_price = Number(util.div(define,lesson.lesson_nums).toFixed(6))
                }else{
                    lesson.sale_price = define
                    lesson.unit_price = define
                }
            }
            return lesson
        },
        checkSelectAll(item, index, arr) {
            if(this.selIds.indexOf(item[idField]) !== -1) {
                return true
            } else {
                return false
            }
        },
        refreshData(data) {
            data.forEach((item) => {
                if(this.selIds.indexOf(item[idField]) !== -1) {
                    item.$selected = true
                } else {
                    item.$selected = false
                }
            })
            if(this.multiple) {
                if(data.length == 0) {
                    this.checkAll = false
                }else{
                    this.checkAll = data.every(this.checkSelectAll)
                }
            }
        },
        addSelectedId(id){
            if(this.selIds.indexOf(id) === -1){
                this.selIds.push(id)
                this.refreshData(this.data)
            }
        },
        removeSelectedId(id){
            let index = this.selIds.indexOf(id)
            if(index !== -1){
                this.selIds.splice(index,1)
                this.refreshData(this.data)
            }
        },
        replaceSelectedId(id){
           if(this.selIds.length == 0){
                this.selIds.push(id)
            }else{
                this.selIds.splice(0,1,id)
            }
        },
        toggleSelected(item){
            if(this.multiple){
                if(!item.$selected){
                    this.addSelectedId(item[idField])
                }else{
                    this.removeSelectedId(item[idField])
                }
            }else{
                if(item.$selected){
                    this.ok()
                }else{
                    this.data.forEach(item=>{
                        item.$selected = false
                    })
                    item.$selected = true
                    this.replaceSelectedId(item[idField])
                }
            }
        },
        init_data_cache(){
            if(!this.is_data_init){
                this.init_data()
                this.is_data_init = true
            }
        },
        handleCheckAll() {
            this.data.forEach((item)=>{
                let index = this.selIds.indexOf(item[idField])
                if(this.checkAll === false) {
                    if(index == -1) {
                        this.selIds.push(item[idField])
                        item.$selected = true
                    }
                } else {
                    if(index > -1) {
                        this.selIds.splice(index,1)
                        item.$selected = false
                    }
                }
            })
        },
        refreshSelId(id){
            if(id === null || id.length === 0 || id === '' || id === 0) {
                this.selIds = []
                this.refreshData(this.data)
            }
            if(this.multiple){
                id.forEach(_id=>{
                    if(this.selIds.indexOf(_id) == -1){
                        this.selIds.push(_id)
                    }
                })
            }else{
                if(this.selIds.length == 0){
                    this.selIds.push(id)
                }else{
                    this.selIds.splice(0,1,id)
                }
            }
        },
        cancel(){
            if(this.multiple) {
                this.selIds = []
                this.selected.forEach((item) => {
                    this.selIds.push(item)
                })
                this.refreshData(this.data)
            }else{
                this.selIds = []
                this.selIds.push(this.selected)
                this.refreshData(this.data)
            }
            this.$emit('input',false)
            this.close()
        },
        closeModal() {
            this.cancel()
        }
    },
    watch: {
        'modal$.show': function (val){
            if(val){
                this.init_data_cache()
                this.refreshSelId(this.selected)
            }else{
                if(this.search_field.lesson_name != ''){
                    this.search_field.lesson_name = ''
                    this.is_data_init = false
                }
            }
        },
        selected(id){
            if(id.length === 0 || id === '' || id === 0) {
                this.selIds = []
                this.refreshData(this.data)
            }
            if(this.multiple){
                this.selIds = id
                this.refreshData(this.data)
            }else{
                if(this.selIds.length == 0){
                    this.selIds.push(id)
                }else{
                    this.selIds.splice(0,1,id)
                }
            }
        }
    }
}
</script>
