<template>
	<div>
	    <list ref="service_week_all" v-if="checkAll" @on-check="checkWeek" @on-turn-mode="turnMode"></list>
	    <my-list ref="service_week_my" v-if="checkMy" @on-check="checkWeek" @on-turn-mode="turnMode"></my-list>
	</div>
</template>

<script>
	import common from '@/libs/common.mixin'
	import list from './task-calendar-all.vue'
	import MyList from './task-calendar-my.vue'
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
			},
			turnMode(type) {
				this.$emit('on-turn-mode',type)
            }
		}
	}
</script>