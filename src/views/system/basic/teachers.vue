<template>
	<div class="c-grid row">
        <div class="col-sm-2" style="padding-right:0">
        	<teacher-list @on-select="selectTeacher"></teacher-list>
        </div>
        <div class="col-sm-10">
        	<teacher-profile :eid="eid"></teacher-profile>
        	<teacher-tabs :eid="eid" class="mt-3"></teacher-tabs>
        </div>
	</div>
</template>
<script>
    import TeacherList 		from './teacher/teacher-list.vue'
    import TeacherProfile 	from './teacher/teacher-profile.vue'
    import TeacherTabs		from './teacher/teacher-tabs.vue'
    
    export default {
        components: {   
        	TeacherList,
        	TeacherProfile,
        	TeacherTabs
        },
        data () {
            return {
            	eid: 0
        	}
    	},
        methods:{
        	selectTeacher(id) {
        		this.eid = id
        	}
        },
        mounted(){

        },        
        computed: {

        },
        watch: {
           
        }
    }
</script>