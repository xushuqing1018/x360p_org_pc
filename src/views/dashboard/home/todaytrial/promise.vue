<template>
	<table>
        <tbody>
            <tr v-for="item in data">
                <td width="35%" class="notwrap">
                    <span>{{item.customer.name}}</span>
                    <span v-if="item.eid>0">({{item.eid|ename}})</span>
                </td>
                <td width="35%" class="text-center notwrap">
                    {{formatDid(item)}}
                </td>
                <td width="30%" class="text-right notwrap">
                    <Button type="default" size="small" @click="visit(item)" v-if="item.is_visit==0">确认到访</Button>
                    <Tag color="green" v-else>已到访</Tag>
                </td>
            </tr>
            <tr v-if="data.length == 0">
                <td colspan="3" class="text-center nothing">
                    <Icon type="information-circled" class="mr-1"></Icon>暂无诺到客户
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
				rest_api: ''
			}
		},
		mounted() {
			let today = moment().format('YYYYMMDD')
            this.rest_api = util.sprintf('customer_follow_up?promise_int_day=%s',today)
	  	    this.pageSize = 5
	        this.init_data()
	    },
	    methods: {
	    	formatDid(item) {
	            return this.labelDicts(item.customer_status_did,'customer_status') || '-'
	        },
	        visit(item) {
	        	this.$Modal.open('dashboard/home/todaytrial/visit-confirm.vue@modal',{
	        		on: {
	        			'on-success':() => {
	        				this.init_data()
	        			}
	        		}
	        	})
	        	.then(modal=>{
	        		modal.vuec.set('item',item)
	        		.show(util.sprintf('确认到访【%s】',item.customer.name))
	        	})
	        },
	        deal_data(data) {
	    		this.$emit('on-success',data.total)
	    		return data.list
	    	}
	    }
	}
</script>