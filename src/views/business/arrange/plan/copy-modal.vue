<template>
	<Modal v-drag-modal v-model="modal$.show" :mask-closable="false" :title="modal$.title" width="500">
		<Form>
			<Form-item label="时间段" class="mb-1">
				<Tag :closable="data.length>1?true:false" v-for="i in data" @on-close="delS(i)">{{i.int_start_hour}}~{{i.int_end_hour}}</Tag>
			</Form-item>
			<Form-item label="复制到">
				<CheckboxGroup v-model="days">
					<Checkbox :label="item" v-for="item in 7" v-if="show_weekday(item)">周{{maps[item]}}</Checkbox>
				</CheckboxGroup>
			</Form-item>
		</Form>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	export default {
		mixins: [modal,common],
		props: {
			sections: Array,
			weekdays: Array 
		},
		data() {
			return {
				current_day: 0,
				data: util.copy(this.sections),
				days: util.copy(this.weekdays),
				maps: {1:'一',2:'二',3:'三',4:'四',5:'五',6:'六',7:'天'}
			}
		},
		watch: {
			sections(s) {
				this.data = util.copy(s)
			},
			weekdays(w) {
				this.days = util.copy(w)
			}
		},
		methods: {
			ok() {
				if(this.data.length==0) {
					this.$Message.error('没有时间段可以复制')
					return
				}
				if(this.days.length==1) {
					this.$Message.error('没有选择复制到周几')
					return
				}
				this.$emit('on-ok',this.data,this.days)
				this.close()
			},
			show_weekday(item) {
				return this.weekdays.indexOf(item)>-1&&item!==this.current_day
			},
			delS(i) {
				this.data.splice(i,1)
			}
		}
	}
</script>