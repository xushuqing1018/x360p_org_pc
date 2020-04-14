<template>
    <div class="c-grid">
        <Tabs v-model="tab">
            <TabPane label="学员操作日志" name="student">
                <StudentLog v-if="tab=='student'"/>
            </TabPane>
            <TabPane label="客户名单操作日志" name="customer">
                <CustomerLog v-if="tab=='customer'"/>
            </TabPane>
            <TabPane label="市场名单操作日志" name="market">
                <MarketLog v-if="tab=='market'"/>
            </TabPane>
            <TabPane label="班级操作日志" name="class">
                <ClassLog v-if="tab=='class'"/>
            </TabPane>
            <TabPane label="系统操作日志" name="system">
                <SystemLog v-if="tab=='system'"/>
            </TabPane>
        </Tabs>
    </div>
</template>
<script>
	import util 		from '@/libs/util'
    import grid 		from '@/libs/grid.mixin'
    import globals 		from '@/libs/globals.mixin'
    import common 		from '@/libs/common.mixin'
    import StudentLog  from './logs/student-log.vue' 
    import ClassLog  from './logs/class-log.vue' 
    import CustomerLog from './logs/customer-log.vue'
    import MarketLog from './logs/market-log.vue'
    import SystemLog  from './logs/system-log.vue' 
    export default {
    	mixins:[common,grid,globals],
    	components: {
            StudentLog,
            ClassLog,
            CustomerLog,
            MarketLog,
            SystemLog
    	},
    	data () {
			return {
				tab: 'student'
			}
		},
		mounted () {			
			
		},
		methods: {
        }
    }
</script>