<template>
	<div>
	    <list ref="service_week_all" v-if="checkAll" @on-check="checkWeek"></list>
	    <my-list ref="service_week_my" v-if="checkMy" @on-check="checkWeek"></my-list>
	</div>
</template>

<script>
	import common from '@/libs/common.mixin'
	import list from './remind-all.vue'
	import MyList from './remind-my.vue'
	export default{
		mixins: [common],
		components: {
			list,
			MyList
		},
		data() {
			return {
				type:'all'
			}
		},
		computed: {
			checkAll() {
                if(this.perCheckAllServiceWeek) {
                    if(this.type=='all') {
                        return true
                    }else{
                        return false
                    }
                }else{
                    return false
                }
            },
            checkMy() {
                if(this.perCheckAllServiceWeek) {
                    if(this.type=='my') {
                        return true
                    }else{
                        return false
                    }
                }else{
                    return true
                }
            }
		},
		methods: {
			checkWeek(type) {
                this.type = type
            }
		}
	}
</script>