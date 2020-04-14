<template>
	<transition name="slide-up">
	    <div :class="['ivu-select-dropdown','time-section-dropdown',{'right':placement=='right'}]">
	    	<div class="wrapper">
				<ul class="season-list">
					<li 
						v-for="(item,index) in seasons" 
						:class="active_season(item,index)"
                        :title="item.title+item.name"
						@click="change(item,'season')"
                        :style="{width:liWdith()}"
                        >
                        {{item.title}}({{item.name}})
					</li>
				</ul>
			    <ul class="week-day-list">
			    	<li class="empty">
                        <Icon 
                            :type="showEnter?'reply':'edit'" 
                            class="add-customer" 
                            :title="showEnter?'返回按期段选择':'自定义输入'"
                            @click="changeMode">
                        </Icon>            
                    </li>
			    	<li 
				    	v-for="item in week_day_list"
				    	:class="active_day(item)"
						@click="change(item,'day')">{{item.label}}
				    </li>
			    </ul>
			    <div class="section-list">
                    <template v-if="!showEnter">
    			    	<p v-for="item in orderBy(data,'_int_start_hour')">
    			    		<a :class="{'active':item.$selected}" @click="toggleSelect(item)">{{item.int_start_hour}} ~ {{item.int_end_hour}}</a>
    			    		<Icon type="ios-checkmark" color="#19be6b" size="14" v-if="item.$selected"></Icon>
    			    	</p>
                        <template v-if="!data.length">
                            <span v-if="current.season!==''" class="empty">没有可用的时间段&nbsp;
                                <a class="text-info" @click="addTimeSection">添加</a>
                            </span>
                            <span v-else class="empty">没有可用的期段</span>
                        </template>
                    </template>
                    <template v-else>
                        <Form :label-width="65" :model="infoEnter" class="ivu-form-item-not-required">
                            <Form-item label="开始时间">
                                <Row>
                                    <Col span="7">
                                        <Time-picker 
                                            confirm
                                            placement="bottom-start"
                                            @on-change="infoEnter.int_start_hour=$event" 
                                            style="width:70px" 
                                            size="small" 
                                            :value="infoEnter.int_start_hour" 
                                            format="HH:mm" 
                                            :steps="[1,15,15]" 
                                            placeholder="00:00">
                                        </Time-picker>
                                    </Col>
                                    <Col span="6">
                                        <Select @on-change="setIntEndHourByTimelong" size="small" style="width:75px;">
                                            <Option 
                                                v-for="item in timelong" 
                                                :value="item.name" 
                                                :key="item.name">{{ item.title }}
                                            </Option>
                                        </Select>
                                    </Col>
                                </Row>
                            </Form-item>
                            <Form-item label="结束时间">
                                <Time-picker 
                                    confirm
                                    placement="bottom-start"
                                    @on-change="infoEnter.int_end_hour = $event" 
                                    style="width:70px" 
                                    size="small" 
                                    :value="infoEnter.int_end_hour" 
                                    format="HH:mm" 
                                    :steps="[1,15,15]" 
                                    placeholder="00:00">
                                </Time-picker>
                            </Form-item>
                        </Form>            
                    </template>
			    </div>
                <div class="section-picker-confirm">
                    <Button type="text" size="small" @click="clear">清空</Button>
                    <Button type="primary" size="small" @click="ok">确定</Button>
                </div>
			</div>
			<time-section-info-modal 
				ref="ts_info" 
				:season="current.season" 
				:week-day="current.day" 
				@save="init_data">
			</time-section-info-modal>
	    </div>
	</transition>
</template>
<script>
import moment from 'moment'
import util from '@/libs/util'
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import TimeSectionInfoModal from 'c%/TimeSectionInfoModal.vue'

export default {
    mixins: [common,globals],
    props:{
        value: {
            type: Boolean,
            default: false
        },
        date: {
        	type: [String,Number],
        	default: ''
        },
        multiple: {
            type: Boolean,
            default: false
        },
        selected: {
			type: [Array, Number, String],
			default(){
				return []
			}
		},
        placement: {
            type: String,
            default: 'left'
        }
    },
    components: {
    	TimeSectionInfoModal
    },
    data() {
        return {
            week_day_list: [
            	{label:'周一',value:'1'},
            	{label:'周二',value:'2'},
            	{label:'周三',value:'3'},
            	{label:'周四',value:'4'},
            	{label:'周五',value:'5'},
            	{label:'周六',value:'6'},
            	{label:'周日',value:'7'}
            ],
            current: {
            	season:'',
            	day:''
            },
            selIds: [],
            data: [],
            showEnter: false,
            infoEnter: {
                int_start_hour: '',
                int_end_hour: ''
            },
            currentItem: {}
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
        seasons() {
            return this.dicts('season')
        },
        season_names() {
            let data = []
            this.seasons.forEach(s => {
                data.push(s.name)
            })
            return data
        },
        timelong(){
            return this.$store.state.gvars.dicts['timelong']
        }
    },
    mounted() {
        this.getSeasonAndDay()
    },
    methods: {
        clear() {
            if(this.selIds.length==0) return
            this.$emit('on-clear')
        },
        ok() {
            if(this.showEnter) {
                if(this.infoEnter.int_start_hour==='') {
                    this.$Message.error('请先输入开始时间')
                    return
                }
                if(this.infoEnter.int_end_hour==='') {
                    this.$Message.error('请先输入结束时间')
                    return
                }
                this.$emit('on-select',{
                    int_start_hour: this.infoEnter.int_start_hour,
                    int_end_hour: this.infoEnter.int_end_hour
                })
            }else{
                if(this.selIds.length==0) return
                this.$emit('on-select',this.currentItem)
            }
        },
        change(item,type) {
        	if(type == 'season') {
        		if(item.name == this.current.season) return
    			this.current.season = item.name
        	}else{
        		if(item.value == this.current.day) return
    			this.current.day = item.value
        	}
        	this.init_data()
        },
        active_season(item,index) {
        	if(item.name == this.current.season) {
        		return index ? 'active' : 'active-first'
        	}else{
        		return ''
        	}
        },
        active_day(item) {
        	return item.value == this.current.day ? 'active' : ''
        },
        init_data() {
        	let ret = util.copy(this.get_time_sections(this.current.day,this.current.season))
            ret.forEach(r => {
                r._int_start_hour = Number(this.$filter('format_int_hour')(r.int_start_hour))
            })
            this.data = ret
        	this.refreshData(this.data)
        },
        toggleSelect(item) {
			if(item.$selected){
                this.removeSelectedId(item.tsid)
                // this.$emit('on-select')
                this.currentItem = {}
            }else{
                this.replaceSelectedId(item.tsid)
                // this.$emit('on-select',item)
                this.currentItem = item
            }
		},
        refreshData(data) {
        	data.forEach(item => {
        		if(this.selIds.indexOf(item.tsid) !== -1) {
                    item.$selected = true
                } else {
                    item.$selected = false
                }
        	})
        },
        addSelectedId(id) {
			if(this.selIds.indexOf(id) === -1) {
				this.selIds.push(id)
				this.init_data()
			}
		},
		removeSelectedId(id) {
			let index = this.selIds.indexOf(id)
            if(index !== -1){
                this.selIds.splice(index,1)
                this.init_data()
            }
		},
		replaceSelectedId(id){
            if(this.selIds.length == 0){
                this.selIds.push(id)
            }else{
                this.selIds.splice(0,1,id)
            }
            this.init_data()
        },
        getSeasonAndDay() {
    		let format_date,index
    		if(this.date) {
        		index = String(this.date).indexOf('-')
        		format_date = index==-1?this.$filter('int_date')(this.date):this.date
    		}else{
    			format_date = moment().format('YYYY-MM-DD')
    		}
            this.current.day    = util.get_week_day(new Date(format_date))

            if(this.seasons.length > 0) {
                let season_by_date = this.get_season_by_date(new Date(format_date)),
                    season_index = this.season_names.indexOf(season_by_date)
                if(season_index !== -1) {
                    this.current.season = season_by_date
                }else{
                    if(this.season_names.indexOf('A') !== -1) {
                        this.current.season = 'A'
                    }else{
                        this.current.season = this.season_names[0]
                    }
                }
                this.init_data()
            }
        },
        addTimeSection() {
        	this.$refs.ts_info.show('添加时间段')
        },
        changeMode() {
            this.showEnter = !this.showEnter
        },
        setIntEndHourByTimelong(minute){
            if(this.infoEnter.int_start_hour == ''){
                this.$Message.error('请先输入开始时间')
                return false
            }
            let minutes = util.int(minute)
            this.infoEnter.int_end_hour = util.int_hour_add_minutes(this.infoEnter.int_start_hour,minutes)
        },
        liWdith() {
            if(this.seasons.length>5) {
                return Math.floor(1/this.seasons.length*100)+'%'
            }
            return '20%'
        }
    },
    watch: {
    	selected(arr){
        	if(arr.length === 0 || arr === '' || arr === 0) {
        		this.selIds = []
        		this.init_data()
        	}
        },
        '$store.state.branch.id': {
            handler: function() {
                this.init_data()
            }
        }
    }
}
</script>
<style lang="less">
	.ivu-select-dropdown.time-section-dropdown {
		width: 380px;
    	height: 240px;
    	max-height: 500px;
    	padding: 0;
        &.right {
            right: 0;
        }
    	.wrapper {
			position: relative;
    	}
        ul.season-list {
            padding-left: 44px;
            height: 30px;
            line-height: 28px;
            font-size: 12px;
            li {
                display: inline-block;
                border: 1px solid #dddee1;
                border-left: 0;
                cursor: pointer;
                background: #eee;
                word-break: keep-all;
                white-space: nowrap;
                overflow: hidden;
                // text-overflow: ellipsis;
                width: 20%;
                text-align: center;
                &:first-child {
                    border-left: 1px solid #dddee1;
                }
                &:hover {
                    color: #2d8cf0;
                }
                &.active-first {
                    border-color: #2d8cf0;
                    box-shadow: none;
                }
                &.active{
                    border-color: #2d8cf0;
                    color: #2d8cf0;
                    box-shadow: -1px 0 0 0 #2d8cf0;
                }
            }
        }
        ul.week-day-list {
            position: absolute;
            top: 0;
            width: 45px;
            font-size: 12px;
            li {
                display: block;
                padding: 6px 0;
                text-align: center;
                border: 1px solid #dddee1;
                border-top: 0;
                cursor: pointer;
                background: #eee;
                &:first-child {
                    border-top: 1px solid #dddee1;
                }
                &:hover {
                    color: #2d8cf0;
                }
                &.empty {
                    border-right: 0;
                    width: 44px;
                    height: 30px;
                    .add-customer {
                        color: #39f;
                        font-size: 14px;
                    }
                }
                &.active{
                    border-color: #2d8cf0;
                    color: #2d8cf0;
                    box-shadow: 0 -1px 0 0 #2d8cf0;
                }
            }
        }
        .section-list {
            padding: 15px 15px 15px 80px;
            height: 200px;
            overflow-y: auto;
            overflow-x: hidden;
            p {
                line-height: 24px;
                i {
                    vertical-align: middle;
                }
            }
            .active {
                color: #39f !important;
            }
        }
        .section-picker-confirm {
            position: absolute;
            top: 208px;
            right: 15px;
        }
        .ivu-form-item-not-required .ivu-form-item-label:before{
            font-size: 0 !important;
        }
	}
</style>