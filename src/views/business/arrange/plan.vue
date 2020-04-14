<template>
 	<div class="c-grid">
        <RadioGroup v-model="type" class="mb-3" type="button">
            <Radio :label="0">自定义排课计划</Radio>
            <Radio :label="1">默认排课计划</Radio>
        </RadioGroup>
	    <customize-plan v-if="type==0"></customize-plan>
        <default-plan v-else></default-plan>
	</div>
</template>
<script>
import CustomizePlan from './plan/customize-plan.vue'
import DefaultPlan from './plan/default-plan.vue'
export default {
    mixins:[],
    components: {
        CustomizePlan,
        DefaultPlan
    },
    data() {
        return {
            type: 0
        }
    }
}
</script>