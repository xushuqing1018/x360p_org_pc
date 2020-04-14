<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="600">
		<Form :label-width="80" style="min-height: 380px;">
			<Form-item label="分摊金额" class="custom-form-item-required">
				<InputNumber 
					v-model="data.amount" 
					:max="max_amount" 
					:min="1"
					@on-change="averageAmount">
				</InputNumber>
			</Form-item>
			<Form-item label="分摊年月" class="custom-form-item-required">
				<div class="row">
					<DatePicker 
						v-model="date" 
						type="month" 
						class="col-sm-6" 
						open
						@on-change="tallyDateChange">
					</DatePicker>
					<div class="col-sm-6">
						<div class="tally-day">
							<label>记账日</label>
							<InputNumber 
								v-model="day" 
								:min="1" 
								:max="31" 
								@on-change="tallyDayChange">
							</InputNumber>
						</div>
						<div class="tally-date">
							<p v-for="(item,index) in data.items">
								<DatePicker 
									:value="item.day" 
									@on-change="item.day = $event" 
									style="width: 120px;">
								</DatePicker>
								<InputNumber 
									v-model="item.amount" 
									:min="0"
									:max="data.amount"
									@on-change="itemAmountChange($event,index)">
								</InputNumber>
								<Icon 
									type="close" 
									color="#f30" 
									size="14" 
									@click.native="delItem(item,index)" 
									style="vertical-align: middle;cursor: pointer;">
								</Icon>
							</p>
						</div>
					</div>
				</div>
			</Form-item>
		</Form>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	export default {
		mixins: [modal],
		data() {
			return {
				data: {
					amount: 0,
					items: []
				},
				max_amount: 0,
				date: moment().format('YYYY-MM'),
				day: 1
			}
		},
		watch: {
			'modal$.show':function(val) {
				if(val) {
					this.max_amount = this.data.amount
					if(this.data.items.length == 0) {
						this.data.items.push({
							day: moment().format('YYYY-MM')+'-01',
							amount: this.data.amount
						})
					}
				}
			}
		},
		methods: {
			ok() {
				if(!this.check()) {
					return
				}
				this.$emit('save',this.data)
				this.close()
			},
			check() {
				let copy = [],temp = [],amount = 0
				if(this.data.items.length === 0) {
					this.$Message.error('你还没有分摊')
					return false;
				}
				for(let i=0,len=this.data.items.length;i<len;i++) {
					let item = this.data.items[i]
					if(item.day == '') {
						this.$Message.error('日期不能为空')
						return false;
					}
					if(!item.amount) {
						this.$Message.error('分摊金额不能为空')
						return false;
					}
					if(copy.indexOf(item.day) === -1) {
						copy.push(item.day)
					}else{
						if(temp.indexOf(item.day) === -1) {
							temp.push(item.day)
						}
					}
					amount = util.add(amount,item.amount)
				}
				if(temp.length > 0) {
					this.$Message.error('日期不能重复')
					return false;
				}
				if(this.data.amount < amount) {
					this.$Message.error('分摊金额超额了')
					return false;
				}
				if(this.data.amount > amount) {
					this.$Message.error(`${this.data.amount}元你还没有分摊完`)
					return false;
				}
				return true
			},
			delItem(item,index) {
				this.data.items.splice(index,1)
				let len = this.data.items.length
				if(len === 0) {
					return;
				}
				let lastItem = this.data.items[len - 1]
				this.$set(this.data.items,len - 1,{
					day: lastItem.day,
					amount: util.add(lastItem.amount,item.amount)
				})
			},
			tallyDateChange(value) {
				let date = moment(util.new_date(value)).add(this.day-1,'days').format('YYYY-MM-DD')
				if(this.data.items.findIndex(item => item.day === date) > -1) return;
				this.data.items.push(
				{
					day: date,
					amount: 0
				})
				this.averageAmount()
			},
			tallyDayChange(value) {
				this.data.items.forEach(item => {
					let ym = moment(item.day).format('YYYY-MM-DD').substring(0,7)
					item.day = moment(new Date(ym)).add(value-1,'days').format('YYYY-MM-DD')
				})
			},
			averageAmount() {
				let len = this.data.items.length
				let average = util.float(util.div(this.data.amount,len).toFixed(2))
				this.data.items.forEach(item => {
					item.amount = average
				})
				let total = util.mul(average,len)
				let diff = util.sub(this.data.amount,total)
				if(diff!==0) {
					this.data.items[len-1].amount = util.add(this.data.items[len-1].amount,diff)
				}
			},
			itemAmountChange(event,index) {
				let pre = 0,next = 0,len=this.data.items.length
				if(len === 1) return;
				for(let i=0;i<len;i++) {
					let item = this.data.items[i]
					if(i < index) {
						pre = util.add(pre,item.amount)
					}
				}
				next = util.sub(this.data.amount,util.add(event,pre))
				let average = Math.round(next / (this.data.items.length - index - 1)*100)/100
				for(let i=0;i<len;i++) {
					let item = this.data.items[i]
					if(i > index) {
						item.amount = average
					}
				}
			}
		}
	}
</script>