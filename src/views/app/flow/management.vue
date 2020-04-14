<template>
	<div>
	    <list ref="flow_all" v-if="checkAll" @on-check="checkFlow"></list>
	    <my-list ref="flow_my" v-if="checkMy" @on-check="checkFlow"></my-list>
	</div>
</template>

<script>
	import common from '@/libs/common.mixin'
	import list from './management-all.vue'
	import MyList from './management-my.vue'
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
                if(this.perCheckAllFlow) {
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
                if(this.perCheckAllFlow) {
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
			checkFlow(type) {
                this.type = type
            }
		}
	}
</script>