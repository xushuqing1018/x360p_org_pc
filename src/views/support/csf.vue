<template>
    <div>
        <div class="text-center m-t m-b">
            <RadioGroup v-model="tab" type="button" size="large">
                <Radio label="vod">课标视频</Radio>
                <Radio label="case">课案集</Radio>
            </RadioGroup>
        </div>
        <course-vod v-if="tab=='vod'"></course-vod>
        <course-case v-if="tab=='case'"></course-case>
    </div>
        
</template>

<script>
    import CourseCase from './csf/course-case.vue'
    import CourseVod from './csf/course-vod.vue'

    export default {
        components:{
            CourseCase,
            CourseVod
        },
        data(){
            return {
                tab:'vod'
            }
        }
    }
</script>
