
# 1. 들어가며

웹 크롤링이나 API 활용 시, 무작정 `for` 문을 돌리다 보니 시간이 오래 걸린다.

비동기에 대해서 알아보자. 그전에 비동기 프로그래밍을 이해하기 전 알면 좋은 선행 지식들 먼저 알아보자.

## 1.1 배경 지식 및 필요성

#### I/O Bound vs CPU Bound

컴퓨터 프로그램의 병목 현상은 크게 I/O Bound, CPU Bound 2가지로 나뉜다. 비동기 프로그래밍의 목적은 I/O Bound 문제를 해결하기 위함이다.

> **_I/O(Input/Output) 작업은 프로그램이 CPU를 사용하는 것이 아닌, 외부와 데이터를 주고받는 시간_**

예를 들어, 파일을 읽고 쓰거나, DB 조회, 웹페이지 다운로드 등을 수행하는데 걸리는 시간이다. 이는 CPU 속도에 비해 매우 느린 속도이다. 인터넷에 요청을 보내고 응답을 기다리는 시간 자체가 CPU 관점에서는 매우 긴 시간이다.

> **_CPU Bound는 CPU의 연산 속도가 좌우하는 작업_**

예를 들어, 복잡한 수학 연산, 데이터 분석, 머신러닝 학습 등을 수행하는데 걸리는 시간이다. 이 경우 비동기 처리는 큰 이점이 없고, 멀티 프로세싱(Multi-processing) 이 더 적합하다.

위 내용들은 동시성과 병렬성의 차이로 이어진다.

#### 동시성과 병렬성

**동시성(Concurrency)** 은 ==싱글 코어(Single Core)에서 여러 작업이 번갈아 가며 실행==되어, 마치 동시에 실행되는 것처럼 보이게 하는 논리적 개념이다. Python의 `asyncio`는 기본적으로 이 동시성을 구현한다.(Context Switching을 통한 시분할 처리)

**병렬성 (Parallelism)** 은 ==멀티 코어(Multi Core)에서 물리적으로 여러 작업이 실제로 동시에 실행==(`multiprocessing` 모듈의 영역)

#### 블로킹(Bloking)과 논블로킹(Non-blocking) I/O

> **_블로킹 I/O (Blocking I/O)는 특정 작업이 완료될 때 까지 제어권(Control)을 반환하지 않는 방식_**

이로 인해 호출자는 작업이 끝날 때까지 스레드가 차단되어 아무런 작업도 수행할 수 없다.

> **_논블로킹 I/O (Non-blocking I/O)은 호출된 함수가 작업을 즉시 시작하고 제어권을 바로 반환하는 방식_**

실제 데이터 전송이 완료되면 콜백이나 이벤트를 통해 결과를 통지 받음

---
# 2. 비동기 프로그래밍

## 2.1 정의

> **_비동기 프로그래밍(Asynchronous Programming)이란, 특정 작업의 완료를 기다리지 않고, 다음 작업을 수행하는 프로그래밍_**

자세히 설명하면, 이는 프로그램의 주 실행 흐름(Main Thread)이 특정 작업의 완료를 기다리지 않고, 즉시 다음 작업을 수행할 수 있도록 하는 프로그래밍 실행 모델(Execution Model)임을 의미한다. 

이는 작업의 ==요청(Request)과 결과 처리(Response Handling)를 분리==하여, 대기 시간(Latency) 동안 컴퓨팅 자원(CPU)이 유휴 상태(Idle)에 빠지는 것을 방지하고 ==동시성(Concurrency)을 극대화==하는 기법입니다.

#### 쉬운 예시: 라면 끓이기

- **동기(Sync):** 물을 올리고 물이 끓을 때까지 가스레인지 앞에서 멍하니 5분을 기다린다. 물이 끓으면 그제야 면을 넣고, 다 익을 때까지 또 기다린다. 그동안 아무것도 못 한다.    
- **비동기(Async):** 물을 올린다. 물이 끓는 걸 기다리는 동안(`await`), **숙제를 하고 방 청소를 한다.** 물이 끓었다는 알림(Event)이 오면 가서 면을 넣는다. 시간을 훨씬 알차게 쓸 수 있다!
## 2.2 사용 이유

> **_비동기 프로그래밍의 핵심은 시간 효율성_**

1. **속도 향상:** I/O 작업(대기 시간)이 많은 프로그램에서 전체 실행 시간을 대폭 감소
2. **확장성**: 많은 수의 동시 요청 또는 작업 처리에 유용하여 시스템의 확장성을 향상
3. **자원 낭비 방지:** CPU가 아무 일도 안 하고 응답만 기다리는 '유휴 시간(Idle time)' 제거 후, 유용하게 활용
4. **반응성 향상:** 웹 사이트나 앱에서 데이터를 불러오는 동안 화면이 멈추지 않고 스피너(로딩 아이콘)가 돌아가게 함


---
# 3. Python 활용

> **_`asyncio` 라이브러리 활용_**

## 3.1 주요 용어

#### 이벤트 루프 (Event Loop)

> **_이벤트 루프는 무한 루프를 돌면서 등록된 작업(Task)들의 상태를 주기적으로 감시_**


이벤트 루프는 비동기 프로그래밍의 심장부이다. "준비된 작업이 있는가?"를 확인하고, I/O 작업이 완료된 태스크가 있다면 해당 태스크를 깨워(Wake up) 실행을 재개시킨다.

#### 코루틴 (Coroutine)

> **_코루틴은 진입점(Entry point)이 여러 개인 함수_**

일반 함수(Subroutine)는 호출(`call`)되면 시작하고 반환(`return`)되면 종료되지만, 코루틴은 실행 중간에 상태를 유지한 채 일시 정지(Suspend)하고 제어권을 이벤트 루프에 양보한 뒤, 나중에 재개(Resume)할 수 있다.

Python에서는 `async def`로 정의된 함수가 코루틴 객체를 반환합니다.

## 3.2 핵심 문법 및 주요 메서드

### 3.2.1 핵심 문법

#### `async def`와 `await`

`async def`는 네이티브 코루틴(Native Coroutine)을 정의하는 키워드로 이 함수를 호출하면 코드가 즉시 실행되는 것이 아니라, 실행 가능한 코루틴 객체가 반환

`await` 는 `awaitable` 객체(코루틴, Task, Future) 뒤에 사용
- 현재 코루틴의 실행을 일시 중지합니다.
- 제어권을 이벤트 루프로 넘겨 다른 작업이 실행될 수 있게 합니다.
- 기다리던 작업(예: API 응답)이 완료되면 결과를 반환받고 다음 코드를 실행합니다.

### 3.2.2 주요 메서드

| 메서드                | 핵심 기능                                                |
| ------------------ | ---------------------------------------------------- |
| `run`              | 비동기 프로그램의 **진입점(Entry Point)**으로, 이벤트 루프를 생성하고 실행    |
| `get_running_loop` | 현재 실행 중인 **이벤트 루프 객체**를 반환 (Executor 호출 등에 필수)       |
| `gather`           | 여러 코루틴을 동시에 실행하고, 모든 결과를 **입력 순서대로 취합**하여 반환         |
| `as_completed`     | 여러 코루틴을 실행하되, **먼저 완료되는 순서대로** 결과를 반환 (진행률 표시에 유용)   |
| `run_in_executor`  | **동기(Blocking) 함수**를 별도 스레드/프로세스에서 실행하여 이벤트 루프 차단 방지 |
| `Semaphore`        | 동시에 실행 가능한 작업의 **최대 개수를 제한** (서버 부하 및 동시성 제어)        |
| `Lock`             | 공유 자원에 **한 번에 하나의 작업만 접근**하도록 강제 (데이터 무결성 보장)        |
#### A. `asyncio.run(coro)`

- **정의:** 비동기 프로그램의 **진입점(Entry Point)** 역할을 하는 최상위 실행 함수이다.    
- **동작:** 새로운 이벤트 루프를 생성하고, 인자로 받은 코루틴을 실행하여 완료될 때까지 기다린 후, 루프를 닫고 정리(Cleanup)한다.    
- **특징:** 일반적으로 `if __name__ == "__main__":` 블록에서 `main()` 코루틴을 호출할 때 딱 한 번 사용된다.

다시 정리하면, 일반 함수 `func()`를 호출하면 즉시 코드가 실행되고 결과값을 준다. 그러나 비동기 함수 `async def func()` 를 호출하면 코드가 실행되는 게 아니라, 코루틴 객체(Coroutine Object)라는 '실행 계획서'만 덜렁 던져준다. 따라서, `asyncio.run` 는 이 계획서(코루틴)를 받아서, 이벤트 루프(일터)를 만들고, 계획서대로 일을 시킨 뒤, 결과를 받아오는 총괄 책임자를 뜻한다.

```python
import asyncio

async def main():
    print("Hello")
    await asyncio.sleep(1)
    print("World")

if __name__ == "__main__":
    # 비동기 프로그램 실행 (이벤트 루프 생성 -> main 실행 -> 종료)
    asyncio.run(main())
```

#### C. `asyncio.gather(*coroutines)`

- **정의:** 여러 코루틴을 동시에 스케줄링하고 완료될 때까지 기다리는 어그리게이터(Aggregator) 함수이다.    
- **동작:** 입력받은 모든 코루틴을 태스크(Task)로 감싸서 이벤트 루프에 등록한다. 모든 태스크가 완료되면 결과값들을 **입력한 순서대로 리스트에 담아** 반환한다.    
- **특징:** 하나의 태스크라도 예외(Exception)를 발생시키면 즉시 에러를 반환할 수 있다.

```python
import asyncio

async def fetch_data(name, seconds):
    await asyncio.sleep(seconds)
    return f"{name} 데이터"

async def main():
    # 3개의 작업을 동시에 예약 (총 소요 시간은 가장 긴 3초)
    # 1초짜리가 먼저 끝나도, 결과 리스트에는 입력 순서대로(A, B, C) 담깁니다.
    results = await asyncio.gather(
        fetch_data("A", 3),
        fetch_data("B", 1),
        fetch_data("C", 2)
    )
    print(results)  # 출력: ['A 데이터', 'B 데이터', 'C 데이터']

asyncio.run(main())
```
#### D. `asyncio.as_completed(coroutines)`

- **정의:** 여러 코루틴을 실행하되, **완료되는 순서대로** 이터레이터(Iterator)를 반환하는 제너레이터이다.    
- **활용:** 전체 작업이 다 끝날 때까지 기다릴 필요 없이, 먼저 끝난 작업부터 후처리를 하고 싶을 때 사용한다. 사용자에게 진행률(Progress bar)을 보여줄 때 유용하다.

```python
import asyncio

async def download_image(name, seconds):
    await asyncio.sleep(seconds)
    return f"{name} 다운로드 완료"

async def main():
    tasks = [
        download_image("이미지1", 3),
        download_image("이미지2", 1), # 가장 먼저 끝남
        download_image("이미지3", 2)
    ]

    # 완료되는 순서대로 결과를 반환 (순서: 2 -> 3 -> 1)
    for completed_task in asyncio.as_completed(tasks):
        result = await completed_task
        print(result) 

asyncio.run(main())
```
#### B. `asyncio.get_running_loop()`

- **정의:** 현재 스레드에서 **실행 중인 이벤트 루프 객체**를 반환(==Get==)하는 함수이다.
- **활용:** 코루틴 내부에서 이벤트 루프 객체(loop)가 명시적으로 필요할 때 사용한다. 특히 `run_in_executor` 메서드는 `loop` 객체의 메서드이므로, 이를 호출하기 위해 필수적이다.    
- **주의:** 실행 중인 루프가 없으면 `RuntimeError`를 발생시킨다.

get_running_loop()는 루프를 가져오는 것이다. loop를 생성(Create)하는 것은 `asyncio.run()`에서 이미 진행되었다. 따라서, 이미 돌아가고 있는 루프에서 현재 작동 중인 루프 객체를 조회하는 것이다. 
#### E. `asyncio.run_in_executor(executor, func, *args)`

- **배경:** `asyncio`는 단일 스레드이므로, `time.sleep`이나 파일 I/O 같은 동기 함수(Blocking Function)를 호출하면 이벤트 루프 전체가 멈춘다.    
- **해결:** 이 메서드는 별도의 **스레드 풀(ThreadPool)** 또는 프로세스 풀(ProcessPool)에서 해당 동기 함수를 실행하도록 위임한다.    
- **의의:** 비동기 아키텍처 안에서 레거시 동기 코드를 안전하게 통합할 수 있게 해주는 핵심 브리지(Bridge) 역할을 한다.

핵심은 블로킹(동기)함수를 처리하기 위함. `asynico`는 기본적으로 싱글 스레드로 혼자 일한다. 이로 인해 동기 함수(예: 파일 불러오기 또는 저장, 복잡한 계산)를 시키면 전체가 멈춘다. 따라서, 다른 스레드에게 외주를 맡기는 것이다.

```python
import asyncio
import time

# 주의: async def가 아닌 일반 함수 (Blocking Function)
def blocking_io():
    print(f"동기 작업 시작: {time.strftime('%X')}")
    time.sleep(2)  # 일반 sleep은 전체를 멈추게 하지만, executor를 쓰면 괜찮음
    print(f"동기 작업 끝: {time.strftime('%X')}")

async def main():
    loop = asyncio.get_running_loop() # 현재 이벤트 루프 가져오기
    
    # 별도의 스레드에서 blocking_io 함수 실행
    # await를 했지만, 메인 스레드는 멈추지 않음
    await loop.run_in_executor(None, blocking_io)

asyncio.run(main())
```
    
#### F. `asyncio.Semaphore(value)`

- **정의:** 내부 카운터를 통해 **동시에 실행 가능한 작업(Task)의 최대 개수를 제한**하는 동기화 객체이다.    
- **동작:** `async with semaphore:` 블록에 진입하면 카운터가 감소하고, 블록을 빠져나오면 증가한다. 카운터가 0이면 다른 작업은 대기한다.    
- **활용:** API 서버에 과도한 트래픽을 보내지 않도록 **동시 접속자 수(Concurrency)를 제어**할 때 필수적이다.

핵심은 시도 횟수가 아닌 동시 실행 가능 수(Capacity)이다.

```python
import asyncio

async def access_resource(sem, i):
    async with sem:  # 세마포어 획득 (자리가 없으면 여기서 대기)
        print(f"작업 {i} 진입")
        await asyncio.sleep(2)  # 작업 수행
        print(f"작업 {i} 종료") # 세마포어 반납

async def main():
    sem = asyncio.Semaphore(2) # 동시에 최대 2개만 허용
    
    # 5개의 작업을 동시에 시작하려 함
    await asyncio.gather(*[access_resource(sem, i) for i in range(5)])

asyncio.run(main())
# 결과: 2개씩 짝지어 실행됨
```

#### G. `asyncio.Lock()`

- **정의:** 특정 자원에 대해 **한 번에 오직 하나의 코루틴만 접근**하도록 강제하는 상호 배제(Mutual Exclusion) 객체이다.    
- **동작:** 잠금(Acquire) 상태에서는 다른 코루틴이 해당 블록에 접근하지 못하고 대기(Wait)해야 한다.    
- **활용:** 여러 비동기 작업이 동시에 하나의 파일에 쓰기(Write)를 시도할 때, 데이터가 뒤섞이거나 깨지는 **경쟁 상태(Race Condition)를 방지**한다.

`Lock`은 시간 부담을 줄이는게 아니라, 데이터 꼬임 방지(안전 장치)이다. 

```python
import asyncio

shared_resource = 0
lock = asyncio.Lock()

async def safe_increment():
    global shared_resource
    async with lock:  # 락을 획득해야만 아래 코드 실행 가능
        print("자원 접근 중...")
        temp = shared_resource
        await asyncio.sleep(0.1) # 다른 작업이 끼어들 틈을 줌 (Race Condition 시뮬레이션)
        shared_resource = temp + 1
        print(f"값 증가: {shared_resource}")

async def main():
    # 락이 없으면 값이 엉망이 되지만, 락 덕분에 순차적으로 실행되어 정확히 5가 됨
    await asyncio.gather(*[safe_increment() for _ in range(5)])

asyncio.run(main())
```

#### 참고: 순서도

> 준비 단계 -> 작업 분개 -> 개별 작업 수행(반복) -> 마무리

> _**STEP 1: 프로그램 시작 (준비 단계)**_

가장 먼저 관리자(이벤트 루프)를 출근시키고, 도구(세마포어, 락)를 준비합니다.

1. `asyncio.run(main())`    
    - **Start:** 프로그램의 시작 버튼입니다. 이벤트 루프를 생성하고 `main` 함수를 실행합니다.        
2. `loop = asyncio.get_running_loop()`    
    - **Setup:** `main` 함수 내부에서 가장 먼저 실행됩니다. 나중에 쓸 '스레드(일꾼)'를 부르기 위해, 현재 관리자(Loop)의 연락처를 확보합니다.        
3. `sem = asyncio.Semaphore(N)` / `lock = asyncio.Lock()`    
    - **Setup:** 동시에 일할 수 있는 인원 제한(세마포어)과 금고 열쇠(락)를 책상 위에 올려둡니다.

> **_STEP 2: 작업 분배 (스케줄링)_**

이제 100개의 작업(Task)을 한꺼번에 실행 대기열에 올립니다.
4. `asyncio.gather` 또는 `asyncio.as_completed`    
    - **Dispatch:** 준비된 작업(Task)들을 이벤트 루프에 등록합니다.        
    - "자, 여기 있는 100개 작업 동시에 시작해!"라고 명령을 내립니다.

> _**STEP 3: 개별 작업 수행 (워커의 시점)**_

여기서부터는 각 작업(Task) 내부에서 벌어지는 일입니다. 100개의 작업이 동시에 이 과정을 겪습니다.

5. `async with sem:` (Semaphore 진입)
    - **Check:** 작업이 시작되자마자 문지기를 만납니다.
    - "지금 10명 꽉 찼나요?" -> 꽉 찼으면 대기(`await`), 자리 나면 입장.
6. `await loop.run_in_executor(...)`
    - **Delegate:** 입장해서 일을 하려는데, 너무 오래 걸리는 칼질(동기 함수)이 있습니다.        
    - 아까 STEP 1에서 받은 `loop` 연락처로 다른 스레드(알바생)에게 일을 토스하고 결과가 올 때까지 쉽니다.        
7. `async with lock:` (Lock 진입)
    - **Safety:** 일이 다 끝나고 장부에 기록하려는데 장부는 하나뿐입니다.        
    - "누가 쓰고 있나요?" -> 쓰고 있으면 대기(`await`), 없으면 내가 쓰고 나옵니다.

> _**STEP 4: 마무리**_

모든 개별 작업이 끝나면 다시 관리자(main) 시점으로 돌아옵니다.
8. 결과 수집 (`gather`의 경우)    
    - 모든 Task가 STEP 3를 통과해서 완료되면, 결과를 리스트로 받습니다.        
9. `asyncio.run` 종료    
    - 이벤트 루프를 닫고 프로그램을 완전히 종료합니다.

```python
import asyncio
import time

# --- [전역 변수] ---
TOTAL_SALES = 0  # 총 매출액

# --- [동기 함수] : 알바생이 할 일 (오래 걸리는 단순 노동) ---
def heavy_chopping(sec):
    # 요리사가 이걸 직접 하면 주방 전체가 멈춤(Blocking)
    time.sleep(sec) 
    return "재료 손질 완료"

# --- [비동기 함수] : 요리사가 할 일 ---
async def make_dish(dish_name, semaphore, lock, loop):
    print(f"👨‍🍳 [대기] {dish_name} 주문 들어옴 (화구 기다리는 중...)")
    
    # 1. Semaphore: 화구(리소스) 제한. 2명만 동시 입장 가능
    async with semaphore:
        print(f"🔥 [요리] {dish_name} 화구 사용 시작!")
        
        # 2. get_running_loop & run_in_executor: 
        # 알바생(Executor)에게 재료 손질(동기 함수) 위임
        # loop는 main함수에서 받아옴
        await loop.run_in_executor(None, heavy_chopping, 1)
        
        # 3. 비동기 대기: 볶는 시간 (다른 요리 주문도 받으면서 함)
        await asyncio.sleep(1) 
        print(f"🍳 [완성] {dish_name} 요리 끝!")

    # 4. Lock: 매출 장부 작성 (동시 접근 금지)
    async with lock:
        global TOTAL_SALES
        temp = TOTAL_SALES
        await asyncio.sleep(0.1) # 장부 쓰는 척 대기
        TOTAL_SALES = temp + 10000
        print(f"💰 [장부] {dish_name} 판매 기록 (현재 매출: {TOTAL_SALES}원)")

    return f"{dish_name} 서빙 완료"

# --- [메인 함수] : 식당 운영 ---
async def main():
    # 5. get_running_loop: 현재 일하는 관리자 호출 (알바생 부르기 위해 필요)
    loop = asyncio.get_running_loop()
    
    # 도구 준비
    stove_sem = asyncio.Semaphore(2) # 화구 2개
    sales_lock = asyncio.Lock()      # 장부 1개
    
    # 주문 5개 생성 (아직 시작 안 함)
    orders = [
        make_dish(f"파스타-{i}", stove_sem, sales_lock, loop) 
        for i in range(1, 6)
    ]

    print("📢 --- 영업 시작 ---")
    
    # 6. as_completed: 먼저 끝나는 요리부터 순서대로 처리
    # (만약 다 같이 끝나길 기다린다면 gather를 썼을 것)
    for completed_task in asyncio.as_completed(orders):
        result = await completed_task
        print(f"🛎️ {result}") # 손님에게 알림

# --- [진입점] ---
if __name__ == "__main__":
    # 7. run: 식당 문 열기
    asyncio.run(main())
```

---
# 4. 실전 비동기 디자인 패턴 (Real-world Async Patterns)

실무에서 대용량 데이터를 처리할 때(예: 이미지 5만 장 OCR), 단순한 `asyncio.gather`만으로는 부족하다. API 속도 제한(Rate Limit)이나 서버 부하를 고려한 5가지 핵심 패턴을 알아보자.

## 4.1 배치 처리 (Batch Processing)

- **개념:** 데이터를 하나씩 개별적으로 처리(Single Request)하는 대신, 일정량(예: 10개)을 묶어서(Chunk) 한 번에 처리하는 기법이다.    
- **이유:** 네트워크 오버헤드(Handshake, Latency)를 줄이고 서버의 병렬 처리 능력을 활용하기 위함이다. 특히 GPU를 사용하는 모델은 배치를 활용해야 효율이 극대화된다.    
- **비유:** 엘리베이터가 한 명 태우고 오르내리는 대신, 10명씩 꽉 채워서 이동하여 효율을 높이는 것과 같다.
    

## 4.2 세마포어 (Semaphore)

- **개념:** 공유 자원에 동시에 접근할 수 있는 작업(Task)의 **최대 개수(공간)를 제한**하는 동기화 도구이다. (`asyncio.Semaphore`)    
- **이유:** `asyncio`는 수천 개의 코루틴을 동시에 생성할 수 있지만, 이를 전부 동시에 실행하면 서버가 폭발하거나 내 컴퓨터의 메모리가 부족해진다. 동시 실행 수(Concurrency)를 물리적으로 제한해야 한다.    
- **비유:** 주차장에 자리가 딱 10칸(`MAX_CONCURRENCY`)밖에 없다. 차가 아무리 많이 와도 10대만 들어갈 수 있고, 꽉 차면 차 한 대가 빠져나갈 때까지 입구 차단기 앞에서 기다려야 한다.
    

## 4.3 턴스타일 / 개찰구 패턴 (Turnstile Pattern)

- **개념:** 세마포어가 '공간'을 제어한다면, 턴스타일은 **'속도(Rate)'를 제어**한다. `Lock`과 `sleep`을 조합하여 작업의 실행 간격을 강제한다.    
- **이유:** 순간적인 트래픽 폭주(Burst)를 방지하기 위함이다. 1분에 60개를 처리할 수 있다고 해서, 1초에 60개를 동시에 던지면 서버는 DDoS 공격으로 간주하고 429 에러를 뱉는다. 1초에 1개씩 꾸준히 던지는 것이 중요하다.    
- **비유:** 지하철 출근 시간, 개찰구는 한 번에 한 명만 통과할 수 있고 카드 찍는 시간 때문에 **1초에 한 명씩만** 들어갈 수 있다. 덕분에 승강장이 한꺼번에 아수라장이 되는 걸 막는다.
    

## 4.4 락 (Lock)

- **개념:** 특정 자원에 대해 **한 번에 오직 하나의 코루틴만 접근**하도록 강제하는 상호 배제(Mutual Exclusion) 장치이다.    
- **이유:** 비동기 환경에서 여러 작업이 동시에 하나의 파일에 쓰기(Write)를 시도하면 데이터가 뒤섞이거나 깨지는 **경쟁 상태(Race Condition)**가 발생한다.    
- **비유:** 공원 화장실은 딱 하나다. 들어갈 땐 열쇠(`Lock`)를 가지고 문을 잠가야 한다. 다른 사람이 아무리 급해도, 안에 있는 사람이 열쇠를 반납할 때까지는 들어갈 수 없다.
    

## 4.5 재시도와 백오프 (Retry & Exponential Backoff)

- **개념:** 네트워크 요청 실패 시 즉시 포기하지 않고 재시도하되, 대기 시간을 점진적으로 늘리는 기법이다.    
- **전략:**    
    1. **지수 백오프(Exponential Backoff):** 대기 시간을 `2초 -> 4초 -> 8초`와 같이 배수로 늘린다.        
    2. **지터(Jitter):** 대기 시간에 무작위성(Randomness)을 추가한다.        
- **이유:** 모든 요청이 동시에 실패하고 동시에 재시도하면 서버에 2차 충격을 주는 **Thundering Herd Problem**이 발생한다. 랜덤 시간을 섞어 이를 분산시켜야 한다.
- **비유:** 친구 집 초인종을 눌렀는데 답이 없다. 바로 다시 누르지 않고 5초, 그다음엔 10초, 20초... 점점 오래 기다렸다가 누르는 것이 예의다. (계속 누르면 차단당한다)



---

> [!example] Reference
> - [python 비동기를 뿌셔보자](https://velog.io/@judy_choi/python-%EB%B9%84%EB%8F%99%EA%B8%B0%EB%A5%BC-%EB%BF%8C%EC%85%94%EB%B3%B4%EC%9E%90#reference)
> - [파이썬 비동기 처리 예제 코드](https://www.daleseo.com/python-asyncio/)

