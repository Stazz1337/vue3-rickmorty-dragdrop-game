<template>
  <div class="container">
    <div
      v-for="(image, index) in images"
      :key="index"
      class="wrapper"
      :class="{ matched: isMatch[index] }">
      <img class="image" v-if="image" :src="image" alt="image" />
    </div>
  </div>
  <h1>Link name to character</h1>
  <div class="container">
    <div
      v-for="(name, shuffledIndex) in shuffledNames"
      :key="shuffledIndex"
      class="wrapper"
      :class="{
        matched: isMatch[shuffledIndex],
        mismatched: isMismatched[shuffledIndex],
      }"
      @dragstart="handleDragStart(shuffledIndex)"
      @dragend="handleDragEnd"
      @dragover.prevent
      @drop="handleDrop(shuffledIndex)"
      :draggable="!isMatch[shuffledIndex]"
      >
      <h4 v-if="name">{{ name }}</h4>
      <p v-if="isMatch[shuffledIndex]">appears in:</p>
      <ul v-if="isMatch[shuffledIndex]" class="episodes-list">
        <li v-for="(episode, episodeIndex) in displayedEpisodes[shuffledIndex]" :key="episodeIndex">
          {{ episode }}
        </li>
        <button v-if="showMoreEpisodes[shuffledIndex]" @click="showMore(shuffledIndex)">
          More
        </button>
      </ul>
    </div>
  </div>
  <button @click="goToGameWon" :disabled="!isGameWon" style="margin-top: 20px;">Done</button>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();
const results = ref([]);
const names = ref([]);
const images = ref([]);
const episodes = ref([]);
const shuffledNames = ref([]);
const isMatch = ref([]);
const isDragging = ref(false);
const draggedIndex = ref(null);
const isMismatched = ref(new Array(4).fill(false));
const displayedEpisodes = ref(new Array(4).fill([]));
const showMoreEpisodes = ref(new Array(4).fill(false));
const isGameWon = computed(() => isMatch.value.every(Boolean));
const goToGameWon = () => router.push("/game-won");

function shuffleArr(arr) {
  const shuffledArr = [...arr];
  for (let i = shuffledArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArr[i], shuffledArr[j]] = [shuffledArr[j], shuffledArr[i]];
  }
  for (let i = 0; i < shuffledArr.length; i++) {
    if (shuffledArr[i] === arr[i]) {
      let j = (i + 1) % shuffledArr.length;
      while (j !== i && shuffledArr[j] === arr[j]) {
        j = (j + 1) % shuffledArr.length;
      }
      if (j !== i) {
        [shuffledArr[i], shuffledArr[j]] = [shuffledArr[j], shuffledArr[i]];
      }
    }
  }
  return shuffledArr;
}

async function makeRequests() {
  const promises = [];
  const ids = Array.from({ length: 4 }, () => Math.floor(Math.random() * 826) + 1);
  ids.forEach((id) => {
    promises.push(
      axios.get(`https://rickandmortyapi.com/api/character/${id}`).then(async (response) => {
        const characterEpisodes = response.data.episode.slice(0, 10);
        const episodePromises = characterEpisodes.map((episodeUrl) => axios.get(episodeUrl));
        const episodeResponses = await Promise.all(episodePromises);
        return {
          ...response.data,
          episodes: episodeResponses.map((ep) => ep.data.name),
        };
      }),
    );
  });
  try {
    results.value = await Promise.all(promises);
    names.value = results.value.map((result) => result.name);
    images.value = results.value.map((result) => result.image);
    episodes.value = results.value.map((result) => result.episodes);
    shuffledNames.value = shuffleArr(names.value);
    for (let i = 0; i < 4; i++) {
      displayedEpisodes.value[i] = episodes.value[i].slice(0, 2);
      showMoreEpisodes.value[i] = episodes.value[i].length > 2;
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

function handleDragStart(index) {
  if (!isMatch.value[index]) {
    draggedIndex.value = index;
    isDragging.value = true;
  }
}

function handleDragEnd() {
  isDragging.value = false;
  draggedIndex.value = null;
}

function handleDrop(index) {
  if (draggedIndex.value !== null && draggedIndex.value !== index && !isMatch.value[index]) {
    const temp = shuffledNames.value[index];
    shuffledNames.value[index] = shuffledNames.value[draggedIndex.value];
    shuffledNames.value[draggedIndex.value] = temp;
    if (shuffledNames.value[index] === names.value[index]) {
      isMatch.value[index] = true;
    } else {
      isMatch.value[index] = false;
    }

    if (shuffledNames.value[draggedIndex.value] === names.value[draggedIndex.value]) {
      isMatch.value[draggedIndex.value] = true;
    } else {
      isMatch.value[draggedIndex.value] = false;
    }
    isMismatched.value[index] = !isMatch.value[index];
    isMismatched.value[draggedIndex.value] = !isMatch.value[draggedIndex.value];
  }
}

function showMore(index) {
  displayedEpisodes.value[index] = episodes.value[index];
  showMoreEpisodes.value[index] = false;
}

onMounted(makeRequests);

watch(shuffledNames, (newNames) => {
  newNames.forEach((name, shuffledIndex) => {
    if (name === names.value[shuffledIndex]) {
      isMatch.value[shuffledIndex] = true;
      isMismatched.value[shuffledIndex] = false;
    } else {
      isMatch.value[shuffledIndex] = false;
    }
  });
});
</script>

<style scoped>
.container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  justify-content: center;
  gap: 10px;
}

.wrapper {
  border-radius: 10px;
  background-color: #f8f8ff;
  width: 300px;
  height: 300px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  border: 2px solid transparent;
}

.container:nth-child(2) .wrapper {
  cursor: grab;
}

.matched {
  border-color: green;
}

.mismatched {
  border-color: red;
}

.episodes-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.episodes-list li {
  font-size: 12px;
}

button {
  background-color: #4CAF50;
  border: none;
  color: white;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  margin: 4px 2px;
  cursor: pointer;
}

button[disabled] {
  background-color: #ccc;
  cursor: not-allowed;
}

h1 {
  margin: 10px auto;
  text-align: center;
}
</style>
