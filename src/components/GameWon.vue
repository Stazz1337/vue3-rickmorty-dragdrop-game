<template>
  <div>
    <h2>Game completed!</h2>
    <button @click="restartGame">Play again</button>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
const router = useRouter();
const restartGame = () => router.push("/");
</script>

<style scoped>
button {
  background-color: #4caf50;
  border: none;
  color: white;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  cursor: pointer;
}

h2 {
  background-image: linear-gradient(to right, red, green);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
