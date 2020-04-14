<template>
    <table>
        <tbody>
                    <tr v-for="item in data">
                        <template v-if="teacher_times_warn">
                            <td width="35%" class="notwrap">
                                <span>{{item.ename}}</span>
                            </td>
                            <td width="65%" class="text-right notwrap">
                                剩余课次：<span style="color:#EF0101">{{item.arrange_times}}次</span>
                            </td>
                        </template>
                        <template v-else>
                            <td width="35%" class="notwrap">
                                <span>{{item.class_name}}</span>
                                <span v-if="item.teach_eid>0">({{item.teach_eid|ename}})</span>
                            </td>
                            <td width="35%" class="text-center notwrap">
                                <span v-if="item.lid>0">{{item.lid|lesson_name}}</span>
                                <span v-else>{{item.sj_id|subject_name}}</span>
                            </td>
                            <td width="30%" class="text-right notwrap">
                                剩余课次：<span style="color:#EF0101">{{item.lesson_times - item.arrange_times}}次</span>
                            </td>
                        </template>
                    </tr>
                    <tr v-if="data.length == 0">
                        <td colspan="3" class="text-center nothing">
                            <Icon type="information-circled" class="mr-1"></Icon>暂无预警
                        </td>
                    </tr>
                </tbody>
            </table>
</template>
<script>
	import util from '@/libs/util'
	import moment from 'moment'
	import grid from '@/libs/grid.mixin'
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'
	export default {
		mixins: [grid,globals,common],
		data() {
			return {
				  rest_api: 'dashboard/class_times_warn',
			}
		},
		mounted() {
	  	    this.pageSize = 5
	        this.init_data()
	    },
	    methods: {
	    	deal_data(data) {
	    		this.$emit('on-success',data.total)
	    		return data.list
	    	}
	    }
	}
</script>