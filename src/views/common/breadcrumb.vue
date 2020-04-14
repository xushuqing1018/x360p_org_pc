<template>
  <div class="nav-position">
    <ol class="breadcrumb">
      <li class="breadcrumb-item" v-for="(item, index) in list">
        <span class="active" v-if="isLast(index)">{{ showName(item) }}</span>
        <router-link :to="safe_path(item.path)" v-else>{{ showName(item) }}</router-link>
      </li>
      <li class="guide-container" v-if="guideOn">
          <Button type="primary" icon="gear-b" @click="showGuide">设置导航</Button> 
      </li>
    </ol>
    <div class="nav-help" v-if="!guideOn && helps.length > 0">
      <Dropdown placement="bottom-end">
          <a href="javascript:void(0)">
              <Icon size="24" type="help-circled"></Icon>
          </a>
          <DropdownMenu slot="list">
              <DropdownItem v-for="item in helps"><a :href="item.url" target="_blank">{{item.title}}</a></DropdownItem>
          </DropdownMenu>
      </Dropdown>
    </div>
  </div>
</template>
<style>
.guide-container{
  position: absolute;
  right:10px;
  top:5px;
}
.nav-position{
  position: relative;
}

.nav-help{
  position: absolute;
  z-index:998;
  right:15px;
  top:10px;
}

</style>
<script>
import bs from '@/bootstrap'
export default {
  props: {
    list: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  methods: {
    safe_path(path){
      if(path == ''){
        return '/'
      }
      return path
    },
    isLast (index) {
      return index === this.list.length - 1
    },
    showName (item) {
      if (item.meta && item.meta.title) {
        item = item.meta && bs.title_replace(item.meta.title)
      }
      if (item.name) {
        item = item.name
      }
      return item
    },
    showGuide(){
      this.$store.state.layout.showSet()
    }
  },
  computed:{
    guideOn(){
      return this.$store.state.guide
    },
    helps(){
      return this.$store.state.router_help
    }
  }
}
</script>
