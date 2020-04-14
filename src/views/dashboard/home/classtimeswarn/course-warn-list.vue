<template>
	<table>
        <tbody>
            <tr v-for="item in data">
                <td width="25%" class="notwrap">
                    <span>{{item.student_name}}</span>
                </td>
                <td width="35%" class="text-right notwrap">
                   {{item.student_lesson.lid|lesson_name}}
                </td>
                <td width="30%" class="text-right notwrap">
                </td>
                <td width="10%" class="text-center notwrap">
                  <Button 
                    type="ghost" 
                    shape="circle" 
                    icon="edit" 
                    size="small"
                    title="修改可用科目及有效期" 
                    @click="editInfo(item)"
                    v-per="'hours.edit'"
                    >
                  </Button>
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
				rest_api: 'dashboard/sl_expire_warn'
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
        editInfo (item) {
				this.$Modal.open('business/student/record/lesson-operate.vue@modal',{
					props: {
						'sl-id': item.sl_id
					},
					on: {
						'on-success':() =>{
							this.init_data()
						}
					}
				})
				.then(modal => {
					let title = item.lid?this.$filter('lesson_name')(item.lid,'-'):this.$filter('subject_name')(item.sj_id,'-')
					modal
					.set('info',item)
					.set('lessonEnd',item.lesson_status==2)
					.set('sl_id',item.sl_id)
					modal.show(util.sprintf('【%s】编辑可用科目及有效期',title))
				})
			},
	    }
	}
</script>