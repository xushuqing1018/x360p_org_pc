<style lang="less">
	.platform {
	    width: 200px;
	    height: 35px;
	    margin-bottom: 5px;
	    border-radius: 4px;
	    color: white;
	    padding-top: 3px;
	    font-size: 16px;
	    background-color: #1894D1;
	}
	.seat-container{
		min-height: 400px;
		max-height: 500px;
		max-width: 100%;
		overflow: auto;
	}
	.x-room-seat-table{			
	    border-collapse: collapse;
    	border-spacing: 0;
    	margin: 1rem auto;
	}
	.x-seat-cell{
	    width: 54px;
	    height: 54px;
	    background-color: #EAEAEA;
	    border: 1px solid #D9D9D9;
	    cursor: pointer;
	    margin: 2px;
	    border-radius: 6px;
        line-height: 54px;
	    font-size: 1.2em;
	    color: inherit;
	}
	.seat-icon{
		background-image: url(../../../img/seat.png);
	    background-repeat: no-repeat;
	    background-position: center;
	    background-color: rgb(122, 219, 229);
	}
	.no-seat{
	    background-image: url(../../../img/stopSeat.png);
	    background-repeat: no-repeat;
	    background-position: center;
	    background-color: rgb(234, 234, 234);
	}
</style>

<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" width="800" :mask-closable="false" @on-cancel="cancel">
		<template v-if="modal$.show">
			<div class="row">
				<Form class="col-sm-10 row">
					<Form-item label="行数：" class="col-sm-3">
						<InputNumber :max="100" :min="1" v-model="rows"></InputNumber>
					</Form-item>
					<Form-item label="列数：" class="col-sm-3">
						<InputNumber :max="100" :min="1" v-model="cols"></InputNumber>
					</Form-item>
				</Form>
				<div class="pull-right">
					<Tag type="dot" color="blue">可用</Tag>
					<Tag type="dot">停用</Tag>
				</div>
			</div>		
			<div class="text-center">			
				<div class="platform m-auto text-center">讲台</div>
				<div class="seat-container">
					<table class="x-room-seat-table">
						<tr v-for="(colItem,colIndex) in data" :key="colIndex">
							<td v-for="(rowItem,rowIndex) in colItem" :key="rowIndex">
								<div class="x-seat-cell" 
									:class="rowItem===1?'seat-icon':'no-seat'" 
									@click="toggleClick(colIndex,rowIndex)">
									{{colIndex+1}} - {{rowIndex+1}}
								</div>
							</td>
						</tr>
					</table>
				</div>
			</div>
			<div slot="footer">
				<span class="text-danger pull-left">提示：点击座位上面小图标可改变座位状态</span>
				<Button type="ghost" @click="cancel">取消</Button>
				<Button type="primary" @click="ok">确定</Button>
			</div>
		</template>
	</Modal>
</template>

<script>
	import Vue from 'vue'
	import modal from '@/libs/modal.mixin'
	export default{
		mixins: [modal],
		data () {
			return {
				rows: 0,
				cols: 0,
				data: [],
				info:{
					cr_id: 0,
					seat_config: []
				},				
				disable_data: []
			}
		},
		watch: {
			rows: function (val) {
				this.init_seat()				
			},
			cols: function (val) {				
				this.init_seat()				
			},
			'info.seat_config': function (val) {
				if(val&&val.length>0){
					this.rows = val.length
					this.cols = val[0].length					
					val.forEach((c,cIndex)=>{
						c.forEach((r,rIndex)=>{
							if(r===0){
								this.disable_data.push(cIndex+'-'+rIndex)
							}
						})
					})
					console.log('this.disable_data')
					console.log(this.disable_data)
				}
				setTimeout(()=>{
					this.data = val
				},10)
			}
		},
		methods: {
			init_seat () {
				let [cols,rows] = [this.cols,this.rows]
				if(cols>0&&rows>0){
					this.data = []
					for(let r=0;r<rows;r++){
						let arr_col = []						
						for(let c=0;c<cols;c++){							
							if(this.disable_data.indexOf(r+'-'+c)>-1){
								arr_col.push(0)	
							}else{
								arr_col.push(1)								
							}
						}
						this.data.push(arr_col)
					}
				}				
			},
			toggleClick (colIndex,rowIndex) {
				let arr = colIndex+'-'+rowIndex
				let index = this.disable_data.indexOf(arr)
				let result = this.data[colIndex][rowIndex]===1?0:1				
				
				Vue.set(this.data[colIndex],rowIndex,result)
				
				if(result===0){
					this.disable_data.push(arr)
				}else{
					if(index>-1){
						this.disable_data.splice(index,1)
					}
				}
			},
			ok () {
				this.info.seat_config = this.data
				this.$rest('classrooms').add_url_param(this.info.cr_id)
				.put(this.info)
				.success(response=>{
					this.saving = false
					this.cancel()
					this.$Message.success('操作成功！')
					this.$emit('on-save-success')
				})
				.error(response=>{
					this.saving = false
					this.error(response.body.message||'操作失败')
				})
			},
			cancel () {
				this.rows = 0
				this.cols = 0
				this.data = []
				this.close()
			}
		}
	}
</script>
