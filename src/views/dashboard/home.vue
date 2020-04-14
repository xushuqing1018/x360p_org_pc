<style lang="less">
.db-radio-group {
    margin: 15px 0;
    .radio {
        padding: 4px 15px;
        text-align: center;
        border: 1px solid #e3e3e3;
        border-radius: 20px;
        background: #f4f5f9;
        cursor: pointer;
        &:nth-child(2n){
            margin-left: 6px;
        }
        &.active {
            color: #fff;
            background: linear-gradient(to right,#3FAEFF,#3399FF);
            border-color: #2d8cf0;
        }
    }
}
</style>
<template>
    <div class="animated fadein" style="padding:15px;padding-top:0">
        <div class="db-radio-group" v-if="is_sdb_open">
            <span 
                class="radio" 
                :class="{'active':current_db==tab.key}"
                @click="current_db=tab.key" 
                v-for="tab in tabs">
                {{tab.name}}
            </span>
        </div>
        <db-default v-if="current_db == 'default'"/>
        <db-cc v-else-if="current_db == 'cc'" />
        <db-service v-else></db-service>
    </div>
</template>
<script>
    import common from '@/libs/common.mixin'
    import DbCc from './db-cc.vue'
    import DbDefault from './db-default.vue'
    import DbService from './db-service.vue'
   
    export default {
        name: 'Home',
        mixins: [common],
        components: {
            DbCc,
            DbDefault,
            DbService
        },
        data() {
            return {
                current_db:'default',
                show_db_option:false,
                tabs: [
                    {key:'default',name:'工作台'},
                    {key:'service',name:'服务台'}
                ]
            }
        },
        mounted(){
            this.init_db_option()
        },
        methods: {
            init_db_option(){
                this.current_db = this.$store.state.dashboard.current
            }
        },
        watch:{
            current_db(nVal){
                this.$store.commit('setDashboard',nVal)
            }
        },
        computed: {
            rids() {
                return this.$store.state.user.info.employee.rids
            },
            has_cc_role() {
                return (this.rids_user.indexOf(7) == -1)?false:true;
            },
            only_cc_role(){
                return this.has_cc_role && this.rids_user.length == 1
            }
        }
    }
</script>