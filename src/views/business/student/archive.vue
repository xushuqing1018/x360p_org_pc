<template>
	<div>
	    <list ref="student_all" v-if="checkAll" @on-check="checkStudent"></list>
	    <my-list ref="student_my" v-if="checkMy" @on-check="checkStudent"></my-list>
	</div>
</template>

<script>
	import common from '@/libs/common.mixin'
	import list from './list.vue'
	import MyList from './my-list.vue'
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
                if(this.perCheckAllStudent) {
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
                if(this.perCheckAllStudent) {
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
			checkStudent(type) {
                this.type = type
            }
		}
	}
</script>