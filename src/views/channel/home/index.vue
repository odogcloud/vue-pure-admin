<script setup lang="ts">
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Edit from "~icons/ep/edit";
import Collection from "~icons/ep/collection";
import Search from "~icons/ep/search";
import Handshake from "~icons/ri/shake-hands-line";
import User from "~icons/ep/user";
import NoticeList from "./NoticeList.vue";

defineOptions({
  name: "Welcome"
});

const steps = [
  {
    title: "① 设置频道名称",
    icon: Edit,
    items: ["开通账号后，先在顶部频道名称旁点击编辑，设置客户看到的频道名称。"]
  },
  {
    title: "② 创建歌单",
    icon: Collection,
    items: ["进入曲库管理的频道歌单，点击新增创建歌单，可以创建多个。"]
  },
  {
    title: "③ 中央曲库选歌",
    icon: Search,
    items: [
      "a、在左侧菜单下方或频道曲库中，点击中央曲库-选歌前往选歌。",
      "b、按歌单、曲风、语种等条件挑选歌曲，加入频道曲库或频道歌单。",
      "c、回到频道曲库点击编辑，为歌曲添加标签、推荐理由和视频。",
      "d、在频道歌单中设置歌曲权重，权重越高显示越靠前。"
    ]
  },
  {
    title: "④ 添加客户",
    icon: User,
    items: [
      "a、在歌曲客户的客户申请中处理申请，选择同意或拒绝。",
      "b、在我的客户中点击添加客户，用客户的完整邮箱搜索后设置权限。"
    ]
  },
  {
    title: "⑤ 促成合作",
    icon: Handshake,
    items: ["客户提交合作申请后，在合作申请菜单中确权并跟进授权事宜。"]
  }
];
</script>

<template>
  <div class="main home bg-bg_color m-6! p-5">
    <section class="home__guide">
      <h3 class="home__title">使用说明</h3>
      <div class="home__steps">
        <div v-for="step in steps" :key="step.title" class="home__step">
          <div class="home__step-icon">
            <component :is="useRenderIcon(step.icon)" />
          </div>
          <div class="mt-2 text-center">{{ step.title }}</div>
        </div>
      </div>
      <el-divider />
      <div v-for="step in steps" :key="step.title" class="home__detail">
        <div class="home__detail-title">{{ step.title }}</div>
        <div class="home__detail-body">
          <p v-for="item in step.items" :key="item">{{ item }}</p>
        </div>
      </div>
    </section>

    <aside class="home__side">
      <NoticeList :type="1" title="公告" />
      <el-divider />
      <NoticeList :type="2" title="手册&附件" />
    </aside>
  </div>
</template>

<style lang="scss" scoped>
.home {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 20px;

  &__title {
    margin-bottom: 16px;
    font-size: 16px;
    font-weight: 700;
  }

  &__steps {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }

  &__step {
    flex: 1;
    min-width: 110px;
  }

  &__step-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 92px;
    font-size: 30px;
    background: var(--el-fill-color);
  }

  &__detail {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;
    line-height: 26px;
  }

  &__detail-title {
    flex-shrink: 0;
    width: 120px;
  }

  &__side {
    padding-left: 20px;
    border-left: 1px solid var(--el-border-color-lighter);
  }
}

@media (width <= 900px) {
  .home {
    grid-template-columns: minmax(0, 1fr);

    &__side {
      padding-left: 0;
      border-left: 0;
    }
  }
}
</style>
