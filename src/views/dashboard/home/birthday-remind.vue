<template>
	<div>
		<div class="panel-header">
            <div class="title">
                <i class="icon-shengri"></i>
                <span>生日提醒</span>
                <Icon type="refresh" @click.native="init_data()"></Icon>
            </div>
            <div class="more cursor" @click="lookMore" v-show="visible">
                3天内共{{total}}人生日
            </div>
        </div>
        <div class="panel-content">
            <table>
                <tbody>
                    <tr>
                        <td class="text-center" v-for="item in data">
                            <letter-avatar
                                title=""
                                size='60' 
                                :src="item.photo_url" 
                                :name='item.student_name || item.ename' 
                                :rounded='true'>
                            </letter-avatar>
                            <div class="name">
                                <span>{{item.student_name || item.ename}}·{{item.sex|sex}}</span>
                            </div>
                            <div class="birth_time">
                                <span>{{item.birth_time.substring(5)}}</span>
                                <span>{{now_year - item.birth_year}}岁</span>
                                <span>生日</span>
                            </div>
                        </td>
                    </tr>
                    <tr v-if="data.length == 0">
                        <td colspan="3" class="text-center nothing">
                            <Icon type="information-circled" class="mr-1"></Icon>暂无生日提醒
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
	</div>
</template>

<script>
import grid from '@/libs/grid.mixin'
import common from '@/libs/common.mixin'
import letterAvatar from 'c%/LetterAvatar.vue'
export default {
	mixins: [grid,common],
	components: {
        letterAvatar
    },
    props: {
        visible: {
            type: Boolean,
            default: true
        }
    },
    name: 'BirthRemind',
    data() {
  		return {
  			rest_api: 'dashboard/birthday_three_days'
  		}
    },
    mounted() {
        this.init_data()
    },
    methods: {
        lookMore() {
            this.$Modal.open('dashboard/home/birthdayremind/more.vue@modal')
            .then(modal=>{
                modal.vuec.init()
                .show('生日提醒','more')
            })
            
        }
    },
    computed: {
    	now_year() {
            return (new Date()).getFullYear()
        } 
    }
}
</script>
<style lang="less" scoped>
    .panel-content {
        position: relative;
        overflow: auto;
        &:before {
            content: '';
            width: 1px;
            height: 85%;
            position: absolute;
            left: 0;
            top: 0;
            transform: scaleX(0.5);
            background-color: #e6e4e4;
        }
    }
</style>