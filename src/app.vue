<template>
    <router-view></router-view>
</template>
<script>
    import Vue from 'vue'
    import Auth from './libs/auth'
    export default {
        name: 'app',
        data() {
            return {

            };
        },
        created() {
            if(!Auth.isLogin()) {
                if(!this.$route.meta.public && this.$route.path != '/login'){
                   this.$router.push('/login') 
                }
            }else{
                if(Auth.isLock() && !this.$route.meta.public && this.$route.path != '/lock'){
                   this.$router.push('/lock') 
                }
            }
            
        },
        beforeDestroy() {

        },
        methods: {

        }
    };
</script>
<style>
    @import './style/font-awesome.css';
    @import './style/icomoon.css';
    @import './style/cropper.min.css';
    @import './style/animate.css';
    @import './style/introjs.min.css';
</style>
<style lang="scss">
    @import './style/scss/style';
</style>

<style lang="less">
    @import './style/iview.less';
    @import './style/style.less';
    @import './style/common.less';
</style>