<template>
    <div>
        <table class="modal-table">
            <thead>
                <th><div class="ivu-table-cell">课程/班级</div></th> 
                <th><div class="ivu-table-cell">可用科目</div></th>
                <th><div class="ivu-table-cell">剩余课时</div></th>
                <th><div class="ivu-table-cell">消耗课时</div></th>
                <th><div class="ivu-table-cell">总课时</div></th>
                <!-- <th><div class="ivu-table-cell">导入/赠送</div></th>
                <th><div class="ivu-table-cell">结转/退费</div></th> -->
                <th><div class="ivu-table-cell">课时状态</div></th>
                <th><div class="ivu-table-cell">是否停课</div></th>
                <th><div class="ivu-table-cell">有效期</div></th>
            </thead>
            <tr v-for="(item,index) in data" :key="index">
                <td>
                    <div class="ivu-table-cell">						
                        <span v-if="item.lid">
                            <tag color="blue">课程</tag>
                            {{item.lid|lesson_name}}
                        </span>
                        <span v-if="item.cid > 0&&item.one_class">
                            <tag color="blue">班级</tag>
                            {{item.one_class.class_name}}
                        </span>
                    </div>
                </td> 
                <td>
                    <div class="ivu-table-cell">
                        {{item.sj_ids|sj_ids_text}}
                    </div>
                </td>
                
                <td>
                    <div class="ivu-table-cell">
                        {{item.remain_lesson_hours}}
                    </div>
                </td>
                <td>
                    <div class="ivu-table-cell">
                        {{item.use_lesson_hours}}
                    </div>
                </td>
                <td>
                    <div class="ivu-table-cell">
                        {{item.total_lesson_hours}}
                    </div>
                </td>
                <!-- <td>
                    <div class="ivu-table-cell">
                        <p>导入：{{item.import_lesson_hours}}</p>
                        <p>赠送：{{item.present_lesson_hours}}</p>
                    </div>
                </td>
                <td>
                    <div class="ivu-table-cell">
                        <p>结转：{{item.transfer_lesson_hours}}</p>
                        <p>退费：{{item.refund_lesson_hours}}</p>
                    </div>
                </td> -->
                <td>
                    <div class="ivu-table-cell">
                        {{item.lesson_status|lesson_status_text}}
                    </div>
                </td>
                <td>
                    <div class="ivu-table-cell">
                        {{item.is_stop|stop_status_text}}
                    </div>
                </td>
                <td>
                    <div class="ivu-table-cell">
                        {{item.expire_time_text}}
                    </div>
                </td>
            </tr>
            <tr v-if="!data.length">
                <td colspan="11">
                    <div class="ivu-table-cell text-center">没有数据</div>
                </td>
            </tr>
        </table>
        <div class="mt-3 text-right">
            <Page
                :total="total" 
                :current="pageIndex"
                :page-size="pageSize" 
                :show-total="true" 
                @on-change="pagenation"
                simple
                >
            </Page>
        </div>
    </div>
</template>

<script>
import moment from 'moment'
import util from '@/libs/util'
import grid from '@/libs/grid.mixin'
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'

export default {
    mixins: [grid,common,globals],
    props: {
        sid: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            pageSize: 4,
            rest_api: 'student_lessons',
        }
    },
    mounted() {
        this.init_data();
    },
    methods: {
        hook_get_param (param) {
            param.sid = this.sid
            param.with =  'one_class'
        }
    }
}
</script>

<style>

</style>
