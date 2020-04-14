<style lang="less">
@import '~@/style/mixin.less';
.arrange-item{
	.clearfix();
	margin:5px;
	background:#fff;
	border-bottom:1px solid #ccc;
	&.is-attendance{
		background:#19BE6B;
		color:#fff;
	}
	&.is-cancel{
		background:#cccccc;
	}
	.rounded(5px);
	.arrange-item-object{
		text-align:center;
		padding:5px;
		border-top:1px solid #eee;
	}
	.arrange-item-base{
		.clearfix();
		padding:5px;
	}
	.arrange-teacher{
		width:50%;
		text-align:center;
		float:left;
	}
	.arrange-room{
		width:50%;
		text-align:center;
		float:right;
	}
}
.cell-popup-btn{
	border-top:1px solid #f2f2f2;
	padding:10px 20px;
}
</style>
<template>
	<div
	:class="classes"
	@click="clickHandle">
		<div class="arrange-item-base">
			<div class="arrange-teacher" @click="teacherClickHandle">
			<Icon type="ios-person"></Icon>{{info.teach_eid|employee_name}}
			</div>
			<div class="arrange-room" @click="classroomClickHandle">
			<Icon type="ios-home"></Icon>{{info.cr_id|classroom_name('未知')}}
			</div>
		</div>
		<div class="arrange-item-object" @click="objectClickHandle">
			<template v-if="info.lesson_type == 0 && info.is_trial == 0">
				<Tag type="border" color="blue">班课</Tag>
				<Tag v-if="info.one_class">{{info.one_class.class_name}}</Tag>
			</template>
			<template v-else>
				<Tag type="border" color="yellow" v-if="info.is_trial == 1">{{info.name}}</Tag>
				<template v-else>
				<Tag type="border" color="green" v-if="info.lesson_type == 1">1对1</Tag>
				<Tag type="border" color="green" v-if="info.lesson_type == 2">1对多</Tag>
				</template>
				<Tag v-for="s in info.students">
				{{s.student.student_name}}
				</Tag>
			</template>
			
		</div>
	</div>
</template>
<script>
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import util from '@/libs/util'

export default{
	name:'arrangeListItem',
	mixins:[common,globals],
	props:{
		info:{
			type:Object,
			default(){
				return {

				}
			}
		}
	},
	methods:{
		teacherClickHandle(){
		},
		classroomClickHandle(){

		},
		objectClickHandle(){

		},
		clickHandle(){
			this.$emit('click',this.info)
		}
	},
	computed:{
		classes () {
            return [
                'arrange-item',
                {
                    'is-attendance': this.info.is_attendance == 1,
                    'is-cancel':this.info.is_cancel == 1
                }
            ]
        }
	}
}
</script>