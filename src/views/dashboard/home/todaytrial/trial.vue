<template>
	<table>
        <tbody>
            <tr v-for="item in data">
                <td width="35%" class="notwrap">
                    <span v-if="item.customer">{{item.customer.name}}</span>
                    <span v-else-if="item.student">{{item.student.student_name}}</span>
                    <span v-if="item.eid>0">({{item.eid|ename}})</span>
                </td>
                <td width="35%" class="text-center notwrap">{{item.lid|lesson_name}}</td>
                <td width="30%" class="text-right notwrap">{{item.int_start_hour|int_hour}}~{{item.int_end_hour|int_hour}}</span></td>
            </tr>
            <tr v-if="data.length == 0">
                <td colspan="3" class="text-center nothing">
                    <Icon type="information-circled" class="mr-1"></Icon>暂无试听学员
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
				rest_api: 'dashboard/today_trial'
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