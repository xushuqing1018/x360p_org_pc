<template>
	<table>
        <tbody>
            <tr v-for="item in data">
                <td width="25%" class="notwrap">
                    <span>{{item.student.student_name}}</span>
                    <span v-if="item.student.ename">({{item.student.ename}})</span>
                </td>
                <td width="40%" class="text-center notwrap">{{item.lid|lesson_name}}</td>
                <td width="35%" class="text-right notwrap">
                    剩余课时：<span style="color:#EF0101">{{item.remain_lesson_hours}}</span>
                </td>
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
				rest_api: 'dashboard/student_lesson_warn'
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