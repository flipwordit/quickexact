<template>
  <div class="card">
    <div class="header">
      <!-- <div class="bookmark"></div> -->
      <div class="title">Directives</div>
      <div class="reference">vuemastery</div>
    </div>
    <div class="content">
      <code>
      Lorem, impdu sit amet consectetur adipisicing elit.
      Exercitationem doloribus fugiat quia placeat debitis?
      Amet soluta corporis magnam sequi laborum sapiente possimus
      maxime nesciunt placeat ex animi, aut, aperiam iusto.
    </code>
    </div>

  </div>
</template>

<script>
export default {
  name: 'Cheat',
}
</script>

<style lang="scss">
@import '../../styles/variables';

.card {
  // padding: 12px 16px;
  z-index: 10;
  line-height: 1.25rem;
  background: white;
  font-size: 1rem;
  transition: all 0.2s;
  border-radius: 4px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  text-align: left;
  color: $black;

  .header {
    background: #dfeeeb;
    padding: 0.625rem;
    font-size: 1.125rem;
    font-family: $worksans;
    font-weight: 500;
    display: flex;
    justify-content: space-between;

    .title {
      text-align: left;
    }

    .reference {
      font-size: 1rem;
      margin-top: auto
    }
  }

  .content {
    padding: 0.5rem 0.625rem;
    font-size: 0.875rem;
  }

  code {
    font-family: $firacode;
  }
}
</style>
