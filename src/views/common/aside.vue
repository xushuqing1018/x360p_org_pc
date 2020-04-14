<template>
  <aside class="aside-menu">
    <Tabs v-model="tab" v-if="per">
        <TabPane name="knowledge" label="知识库">
          <knowledge ref="knowledge"></knowledge>
        </TabPane>
        <TabPane name="attendance" label="考勤看板">
          <attend ref="Attend"></attend>
        </TabPane>
    </Tabs>
    <Tabs v-else>
        <TabPane name="attendance" label="考勤看板">
          <attend ref="Attend"></attend>
        </TabPane>
    </Tabs>
  </aside>
</template>

<script>
import Attend from './aside/attend'
import Knowledge from './aside/knowledge.vue'
export default {
  name: 'appaside',
  components: {
    Attend,
    Knowledge
  },
  data() {
    return {
      per: true,
      tab: 'knowledge'
    }
  },
  mounted() {
    this.checkPer()
  },
  methods: {
    checkPer() {
      let appGroup = this.main.find(item => item.uri == 'app')
      if(appGroup) {
        let hasPerKnow = appGroup.sub.find(item => item.uri == 'app.knowledge')
        if(!hasPerKnow) {
          this.per = false
        }
      }else{
        this.per = false
      }
    }
  },
  computed: {
    main() {
      return this.$store.state.gvars.navs.main
    }
  },
  watch: {
    '$store.state.gvars.navs':function(navs) {
      this.checkPer()
    }
  }
}
</script>
<style lang="less">
  .aside-menu {
    .ivu-tabs-nav-container {
      font-size: 12px;
    }
  }
</style>