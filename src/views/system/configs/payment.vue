<template>
	<Tabs>
		<TabPane label="收钱吧">
			<sqb/>
		</TabPane>
		<TabPane label="微信支付">
			<wx/>
		</TabPane>
		<TabPane label="富友支付">
			<Fy/>
		</TabPane>
	</Tabs>
</template>
<script>
	import Sqb from './payment/sqb.vue'
	import Wx from './payment/wx.vue' 
	import Fy from './payment/fy.vue' 
	export default {
		components: {
			Sqb,
			Wx,
			Fy
		}
	}
</script>