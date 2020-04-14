<template>
 	<div>
        <RadioGroup 
        v-model="type" 
        class="mb-1 ml-2" 
        size="small"
        type="button">
            <Radio :label="1">线上订单</Radio>
            <Radio :label="2">产品管理</Radio>
			<!-- <Radio :label="3">商城设置</Radio> -->
        </RadioGroup>
	    <order-list v-if="type==1" :order-from="1"></order-list>
        <product v-if="type==2"></product>
		<setting v-if="type==3"></setting>
	</div>
</template>
<script>

import Product from './online/product.vue'
import Setting from './online/setting.vue'
import OrderList from './order-list.vue'

export default {
    mixins:[],
    components: {
		Product,
        Setting,
        OrderList
    },
    data() {
        return {
            type: 1
        }
    }
}
</script>