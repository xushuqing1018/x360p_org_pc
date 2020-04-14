<template>
	<div>
		<div class="panel-header">
            <div class="title">
                <i class="icon-daiban"></i>
                <span>待办提醒</span>
                <Icon type="refresh" @click.native="init_data()"></Icon>
            </div>
            <div class="more cursor" @click="showAll" v-show="visible">
                今日共{{total}}条待办
            </div>
        </div>
        <div class="panel-content">
            <table>
                <tbody>
                    <tr v-for="item in data">
                        <td width="70%" :class="item.status == 3 ? 'line-through dark-color' : item.status == 1 ? 'highlight-color' : ''">
                            <span>{{item.desc}}</span>
                            <Icon type="checkmark" v-if="item.status == 2"></Icon>
                        </td>
                        <td class="text-right">
                            <Dropdown trigger="click" v-show="visible">
                                <a href="javascript:void(0)" title="更多操作">
                                    <Icon type="ios-list" size="14"></Icon>
                                </a>
                                <DropdownMenu slot="list">
                                    <DropdownItem @click.native="finished(item)" v-if="item.status!==2" v-per="'backlogs.finished'">标记完成</DropdownItem>
                                    <DropdownItem @click.native="unfinished(item)" v-else v-per="'backlogs.unfinished'">标记待办</DropdownItem>
                                    <DropdownItem @click.native="addLine(item)" v-if="item.status!==3" v-per="'backlogs.addline'">标记废弃</DropdownItem>
                                    <DropdownItem @click.native="cancelLine(item)" v-else v-per="'backlogs.cancelline'">取消废弃</DropdownItem>
                                    <DropdownItem @click.native="del(item)" v-per="'backlogs.delete'">删除</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                            <span>{{item.int_day|int_date}} {{item.int_hour}}</span>
                        </td>
                    </tr>
                    <tr v-if="data.length == 0">
                        <td colspan="2" class="text-center nothing">
                            <Icon type="information-circled" class="mr-1"></Icon>暂无待办事项
                        </td>
                    </tr>
                </tbody>
            </table>
            <span class="text-info" @click="add" v-per="'backlogs.add'" v-show="visible">
                <Icon type="plus" title="添加待办" size="16" :style="{color: theme_color}"></Icon>
            </span>
        </div>
       
	</div>
</template>

<script>
import grid         from '@/libs/grid.mixin'
import common       from '@/libs/common.mixin'
import moment       from 'moment'

export default {
    name: 'TodoList',
    mixins: [grid,common],
    props: {
        visible: {
            type: Boolean,
            default: true
        }
    },
    data() {
  		return {
  			rest_api: 'backlogs',
            pk: 'bl_id'
  		}
    },
    mounted() {
  	    this.pageSize = 5
        this.init_data()
    },
    methods: {
        add() {
            this.$Modal.open('dashboard/home/todolist/info-modal.vue',
                {
                    on:{
                        save:()=>{
                            this.init_data()
                        }
                    }
                }
            )
            .then(modal=>{
                modal.vuec.show('添加待办','add')
            })
        },
        del(item) {
            this.delete(item)
        },
        addLine(item) {
            this.operate(item,3)
        },
        cancelLine(item) {
            this.operate(item,1)
        },
        finished(item) {
            this.operate(item,2)
        },
        unfinished(item) {
            this.operate(item,1)
        },
        operate(item,status) {
            this.$rest('backlogs')
            .add_url_param(item.bl_id)
            .put({status:status,desc:item.desc})
            .success(response => {
                this.init_data()
            })
            .error(response => {
                this.error(response.body.message)
            })
        },
        hook_get_param(params) {
            params['int_day'] = this.today
        },
        showAll() {
            this.$Modal.open('dashboard/home/todolist/arrange.vue@modal',{
                on:{
                    'on-success':()=>{
                        this.init_data()
                    }
                }
            })
            .then(modal=>{
                modal.vuec.init().show('待办管理','show')
            })
        }
    },
    computed: {
        today() {
            return moment(new Date()).format('YYYYMMDD')
        }
    }
}
</script>
<style lang="less" scoped>
    .panel-content {
        position: relative;
        >span {
            position: absolute;
            right: 10px;
            bottom: 5px;
            cursor: pointer;
        }
        &:after {
            content: '';
            width: 1px;
            height: 85%;
            position: absolute;
            top: 0;
            right: 0;
            transform: scaleX(0.5);
            background-color: #e6e4e4;
        }
    }
</style>