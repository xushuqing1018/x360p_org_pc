<template>
    <transition name="slide">
        <div class="global-tip">
            <Icon type="information-circled" :color="'#FCD650'" :size="40" class="gtip-icon"></Icon>
            <div class="gtip-text">{{$store.state.gtip.text}}</div>
            <Icon type="close" :color="'#E8C13B'" :size="20" class="gtip-close" @click="closeGTip"></Icon>
        </div>
    </transition>
</template>

<script>
export default {
    methods: {
        closeGTip() {
            this.$store.commit('closeGTip')
        }
    }
}
</script>

<style scoped>
.slide-enter, .slide-leave-to {
    transform: translateY(-80px);
    opacity: 0;
}

.slide-enter-active, .slide-leave-active {
    transition: all .3s;
}

.global-tip {
    height: 80px;
    position: fixed;
    width: 100vw;
    background-color: #FFFBE5;
    z-index: 1000;
    border-bottom: 1px solid #FCD650;
}

.gtip-icon {
    position: absolute;
    top: 18px;
    left: 5vw;
}

.gtip-text {
    position: absolute;
    color: #5C3C00;
    font-size: 18px;
    top: 25px;
    left: 8vw;
}

.gtip-close {
    position: absolute;
    top: 28px;
    right: 5vw;
    cursor: pointer;
}
</style>
