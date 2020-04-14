<template>
  <div>
    <p>正在登录...</p>
  </div>
</template>

<script>
import {_} from '@/libs/util'
import Auth from '@/libs/auth'
import directive from '@/libs/directive.mixin'
export default {
  name: 'login',
  mixins: [directive],
  data () {
    return {
      loading:false,
      formLogin: {
        account: '',
        password: '',
        captcha: ''
      },
      captchaUrl:'/api/captcha',
      subHost: window.CLIENT_DOMAIN
    }
  },
  methods: { 
    tklogin(){
      let token     = this.$route.query.tk
      if(!token){
        this.$router.push({path:'/login'})
        return;
      }
      let post_data = {token:token}
      this.$http.post('tklogin',post_data)
      .then(response=>{
        Auth.setLocalLogin(response.body.data)
        let path = '/'
        setTimeout(()=>{
          if(this.$route.query.referer){
            path = this.$route.query.referer
          }
          this.$router.replace({ path: path })
        },1000)
        
      },response=>{
        this.$router.push({path:'/login'})
      })
    }
  },
  mounted() {
    this.tklogin()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
  @import '../style/mixin.less';
  .box {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 1280px;
    height: 720px;
    margin: -360px 0 0 -640px;
    border: 1px solid #ccc;
    background: url('../img/login_bg.jpg') no-repeat center center;
  }
  .login-contanier {
    position: absolute;
    top: 50%;
    margin-top: -180px;
    right: 100px; 
    width: 320px;
    height: 360px;
    border-radius: 10px;
    .drop-shadow(0,0,8px,0.4);
    padding: 20px;
    background-color: #fff;
    h3 {
      text-align: center;
      margin-top: 25px;
      color: #aaa;
    }
  }
  .input-container {
    border: 1px solid #999;
    border-radius: 20px;
    padding: 7px 10px;
    margin-top: 25px;
    input {
      padding-left: 15px;
      border: none;
      outline: none;
    }
    .ivu-icon-android-person,
    .ivu-icon-android-unlock {
        float: left;
        margin-top: 1px;
        font-size: 16px;
    }
    .ivu-icon-ios-close-empty {
        float: right;
        font-size: 20px;
        cursor: pointer;
        &:hover {
          transition: All 0.4s ease-in-out;
          transform: rotate(180deg);
        }
    }
  }
  .captcha-contanier {
    margin-top: 20px;
    .captcha-wrap {
      display: inline-block;
      vertical-align: middle;
      padding: 3px 0;
      border: 1px solid #999;
      width: 30%;
      input {
        width: 100%;
        outline: none;
        border: none;
        text-align: center;
      }
    }
    .img-wrap {
      display: inline-block;
      vertical-align: middle;
      margin-left: 20px;
      cursor: pointer;
    }
  }
  .user-container {
    > span {
      color: #aaa;
      padding-left: 20px;
    }
  }
  .forget_pw {
    float: right;
    color: #169bd5;
    margin-top: 15px;
    cursor: pointer;
    &:hover {
        color: #2c7290;
        text-decoration: underline;
    }
  }
  .btn-login {
    width: 100%;
    color: #fff;
    background-color: #41b1e2;
    border-radius: 20px;
    border: none;
    padding: 7px 0;
    margin-top: 20px;
    font-size: 16px;
    cursor: pointer;
    &:hover {
      background-color: #169bd5;
    }
    &:active {
      outline: none;
    }
  }
  .footer {
    position: absolute;
    bottom: 0;
    width: 100%;
    text-align: center;
    line-height: 50px;
    color: #263238;
  }
</style>
