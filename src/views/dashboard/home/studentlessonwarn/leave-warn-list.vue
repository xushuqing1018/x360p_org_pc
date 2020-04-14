<template>
	<table>
        <tbody>
            <tr v-for="item in data">
                <td width="35%" class="notwrap">
                    <span>{{item.student.student_name}}</span>
                </td>
                <td width="65%" class="text-right notwrap">
                    请假次数：<span style="color:#EF0101">{{item.leave_num}}次</span>
                </td>
            </tr>
            <tr v-if="data.length == 0">
                <td colspan="2" class="text-center nothing">
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
				rest_api: 'dashboard/student_leave_warn'
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
	    	},
	    	hook_get_param(param) {
	    		param.leave_num = this.leave_num
	    	}
	    },
	    computed: {
	    	leave_num() {
	    		return this.$store.state.gvars.configs.params.leave_warn_times
	    	}
	    }
	}
</script>