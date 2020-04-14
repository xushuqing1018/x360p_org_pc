<style scoped>
.title {
    font-size: 13px !important;
    color: #525252 !important;
    padding-left: 10px;
}

.panel-content {
    padding: 5px 17px 17px 20px !important;
    background-color: white
}
</style>


<template>
	<div class="warn-box class-times-warn">
		<div class="panel-header" style="background: #FDEAD3">
            <div class="title">
	            <span>{{title}}</span>
	            <!-- <Icon type="refresh" @click.native="init_data()"></Icon> -->
	        </div>
            <!-- <div class="more cursor" @click="lookMore" v-show="visible">
                共{{total}}条记录
                <Icon type="chevron-right"></Icon>
            </div> -->
        </div>
        <div class="panel-content">
            <table>
                <tbody>
                    <tr v-for="item in recent_data">
                        <td width="35%" class="notwrap">
                            <span v-if="title=='最近试听'">{{item.customer?item.customer.name:item.student.student_name}}</span>
                            <span v-else>{{item.customer.name}}</span>
                        </td>
                        <td width="35%" class="text-center notwrap">
                            <span v-if="title=='最近试听'">{{item.customer?item.customer.first_tel:item.student.first_tel}}</span>
                            <span v-else>{{item.customer.first_tel}}</span>
                        </td>
                        <td width="30%" class="text-right notwrap">
                            <span v-if="title=='最近沟通'">{{labelDicts(item.customer_status_did,'customer_status')}}</span>
                            <span v-if="title=='最近试听'">{{item.customer?'意向学员':'正式学员'}}</span>
                            <span v-if="title=='最近分配'">{{item.create_time.split(' ')[0]}}</span>
                        </td>
                    </tr>
                    <tr v-if="recent_data.length == 0">
                        <td colspan="3" class="text-center nothing">
                            <Icon type="information-circled" class="mr-1"></Icon>暂无记录
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        
	</div>
</template>

<script>
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'

export default {
    name: 'ClassTimsWarn',
    mixins: [common,globals],
    props: {
        recent_data :{
            type: Array
        },
        title :{
            type: String
        },
    },
    data() {
  		return {
  		}
    },
    mounted() {
    },
    methods: {
    }
}
</script>
