<template>
	<div>
		<my-hour @on-check="checkHour" v-if="checkMy"></my-hour>
		<all-hour @on-check="checkHour" v-if="checkAll"></all-hour>
	</div>
</template>
<script>
	import common from '@/libs/common.mixin'
	import MyHour from './my-student-lesson-hour.vue'
	import AllHour from './all-student-lesson-hour.vue'
	export default {
		mixins: [common],
		components: {
			MyHour,
			AllHour
		},
		data() {
			return {
				type: 'all'
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
        	checkHour(type) {
        		this.type = type
        	}
        }
	}
</script>