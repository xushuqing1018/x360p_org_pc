<style lang="less">
	.x-select-age {
		input {
			text-align: center;
		}
		.ivu-select-dropdown {
			width: 160px;
			max-height: 800px;
			padding: 10px;
			.age-cell {
				display: inline-block;
				width: 28px;
				height: 28px;
				cursor: pointer;
				em{
					display: inline-block;
				    width: 24px;
				    height: 24px;
				    line-height: 24px;
				    margin: 2px;
				    font-style: normal;
				    border-radius: 3px;
				    text-align: center;
				    transition: all .2s ease-in-out;
				    &.active {
			    	    background: #2d8cf0 !important;
						color: #fff;
				    }
				    &:hover {
				    	background: #eee;
				    }
				}
			}
		}
	}
</style>
<template>
	<div class="x-select-age row">
		<div class="col-sm-5">
			<Input 
				v-model="model[0]" 
				@on-focus="openPanel(1)"
				@on-blur="closePanel(1)">
			</Input>
			<transition name="slide-up" v-if="panel1">
				<div class="ivu-select-dropdown">
					<span class="age-cell" v-for="item in ageList" @click="selectStart(item)">
						<em :class="item.age == model[0]?'active':''">{{item.age}}</em>
					</span>
				</div>
			</transition>
		</div>
		<div class="col-sm-2">
			~
		</div>
		<div class="col-sm-5">
			<Input 
				v-model="model[1]" 
				@on-focus="openPanel(2)"
				@on-blur="closePanel(2)">
			</Input>
			<transition name="slide-up" v-if="panel2">
				<div class="ivu-select-dropdown">
					<span class="age-cell" v-for="item in ageList" @click="selectEnd(item)">
						<em :class="item.age == model[1]?'active':''">{{item.age}}</em>
					</span>
				</div>
			</transition>
		</div>
	</div>
</template>
<script>
	export default {
		props: {
			value:{
				type: Array,
				default: () => {
					return [0,0]
				}
			}
		},
		data() {
			return {
				ageList:[],
				model: this.value,
				panel1: false,
				panel2: false
			}
		},
		mounted() {
			this.buildData()
		},
		methods: {
			buildData(){
				for(let i=0;i<20;i++){
					this.ageList.push({
						age:i
					})
				}
			},
			openPanel(value) {
				value==1?this.panel1 = true:this.panel2 = true
			},
			closePanel(value) {
				value==1?this.panel1 = false:this.panel2 = false
			},
			selectStart(start) {
				let startAge = start.age
				if(startAge > this.model[1]) {
					startAge = this.model[1]
				}
				this.$set(this.model,0,startAge)
				this.$emit('input',this.model)
			},
			selectEnd(end) {
				let endAge = end.age
				if(endAge < this.model[0]) {
					endAge = this.model[0]
				}
				this.$set(this.model,1,endAge)
				this.$emit('input',this.model)
			}
		},
		watch: {
			value(val) {
				this.model = val
			}
		}
	}
</script>