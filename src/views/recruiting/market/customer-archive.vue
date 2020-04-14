<template>
    <div class="archive-bg">
        <Row :gutter="16">
            <Col span="12">
                <div class="archive-card">
                    <div class="archive-item-head">
                        <Icon type="ios-information" :size="20"></Icon>
                        <span class="archive-item-title">基本信息</span>
                    </div>
                    <div class="archive-item-content">
                        <table class="student-info">
                            <tr>
                                <td>校区：</td>
                                <td>{{data.bid|branch_name}}</td>
                                <td>电话：</td>
                                <td>{{data.tel||'未设置'}}</td>
                                <td>性别：</td>
                                <td>{{sex(data.sex)||'未设置'}}</td>
                            </tr>
                            <tr>
                                <td>年级：</td>
                                <td>{{school_grade}}</td>
                                <td>住址：</td>
                                <td>{{data.home_address||'未设置'}}</td>           
                                <td>试听：</td>
                                <td>{{data.is_trial == 0 ? '否' : '是' }}</td>
                            </tr>
                        </table>
                    </div>
                </div>
            </Col>
        </Row>
    </div>
</template>

<script>

import moment 		  	from 'moment'	
import util,{_} 		from '@/libs/util'
import common 		  	from '@/libs/common.mixin'
import globals 		  	from '@/libs/globals.mixin'

export default {
    mixins: [globals,common],
    props:{
	    cuId: {
	    	type:[Number,String],
	    	default: ()=> {
	    		return 0
	    	}
	    }     
    },
    data() {
        return {
            data: {},
            pageSize: 4
        }
    },
    mounted() {
        let id = this.cuId
        this.$rest('customers/'+id).get()
		.success(res=>{
			this.data = res.customer
		}).error(response=>{
			this.error(response.body.message)
		})
    },
    methods: {
        sex (num) {
            let sex = ""
            if (num == 1) {
                sex = '男'
                return sex
            }
            if (num == 2) {
                sex = '女'
                return sex
            }
            sex = '待确认' 
            return sex           
        }
    },
    computed: {
        school_grade() {
            return this.data.school_grade == 0 ? '未设置' : this.$filter('dict_title')(this.data.school_grade,'grade')
        }
    }
}
</script>

<style scoped>
.archive-bg {
    padding: 20px;
    background-color: white;
}

.archive-item-head {
    font-size: 15px;
    color: #3399FF;
    padding: 5px 0px;
    border-bottom: 1px dashed rgb(163, 209, 255);
    margin-bottom: 10px;
    font-weight: bold;
}

.archive-item-title {
    vertical-align: top;
}

.student-info {
    width: 100%;
    font-size: 13px;
    border-collapse: separate;
    border-spacing: 0px 15px;
}

.student-info td:nth-child(odd) {
    text-align: right;
    width: 13%;
    font-weight: bold;
}

.student-info td:nth-child(even) {
    text-align: left;
    width: 20%;
}

.archive-item-more {
    float: right;
    font-size: 13px;
    font-weight: normal;
}
</style>
