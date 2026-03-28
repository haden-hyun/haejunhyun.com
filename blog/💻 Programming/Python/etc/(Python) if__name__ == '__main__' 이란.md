---
title: (Python) if__name__ == '__main__' 이란
created: 2025-06-18
modified: 2025-06-18 23:31
cssclasses:
  - max
tags:
  - python/namespace
  - python/__main__
  - python/__name__
---
> [!summary] 요약

---
# 1. 네임스페이스

> [!hint] 정의 및 활용
> - 정의: 개체를 구분할 수 있는 범위
> - 활용: 객체마다 자신의 영향력을 행사할 수 있는 범위를 제한하여 이름의 중복을 허용

## 1.1 개요
Python은 모든 것이 객체로 구성되어 있으며, 각자의 이름을 가지고 있다. 그러나 이름만으로 각 객체들을 구분짓기에는 객체들의 종류가 너무 많다.
예를 들어, 함수, 변수, 클래스 등 이러한 객체들의 이름을 따로 구분짓는 것은 비효율적이다.

따라서, 네임스페이스를 통해 객체의 영향력 범위를 제한하여 이름만으로 구분짓는 한계를 보완한다.
## 1.2 활용
아래와 같이 함수 `func1` 와 `func2` 안의 변수 `name`은 중복되지만 그 영향력은 각 함수에 종속되어있으며, 함수 간 영향을 주지 않는다.

```python
def func1():
	name = 'HYUN'
def func2():
	name = 'SON'
```

이처럼 네임스페이스들은 locals() 함수를 통해서 확인이 가능하여 크게 3가지로 구분된다.
1. **지역** 네임스페이스(Local namespace): **함수(메소드)** 별로 구분되는 네임스페이스
2. **글로벌** 네임스페이스(Global namespace): **모듈 단위**로 구분되는 네임스페이스
3. **빌트인** 네임스페이스(Built-in namespace): 내장 함수 포함한 **전체 코드** 네임스페이

객체를 참고하는 순서는 ==Local -> Global -> Built-in== 순으로 탐색하지만, **역순 참조는 불가능**하다.

아래와 같이 함수 `WhoIsGoat` 내부에 `word`라는 객체는 명시되지 않기 때문에 그 다음 탐색 순서인 모듈 단위로 탐색하여 전역(global) 변수이 `word`를 찾아 출력한다.

```python
word = 'Shohei Ohtani'

def WhoIsGoat():
	print(word)

WhoIsGoat()
# "Shohei Ohtani"
```

---
# 2. 사용 이유?
`__name__` 의 특징은 `__main__`이라는 값(네임스페이스)으로 설정되어 있다.
```python
print(__name__) # output: __main__
```

그러나 `.py` 파일을 모듈로서 불러와 사용하는 경우에는 `__name__`은 모듈이름을 반환한다.

```python
import numpy

print(numpy.__name__) # output: numpy
```

따라서, `if __name__ == "__main__"`의 의미는 해당 구문이 사용된 파이썬 파일을 직접 실행할 때만 아래 코드를 실행한다는 의미이다.
즉, 다른 파이썬 파일에서 모듈을 불러왔을 때 해당 구문 아래 코드는 실행되지 않는다.

예를 들어, `main.py` 파일 내에서  `example.py` import만 했을 뿐인데, print 문이 출력되는 문제가 발생한다.

```python 
# example.py
print("Hello world!")

# main.py
import example
print("I'm not feeling well")
# output
# "Hello World"
# "I'm not feeling well"
```

따라서, 이를 방지하고자 아래와 같이 코드가 작성된다.
이를 통해서 `example`를 import 해도 print문이 출력되지 않는다!

```python
# example.py
if __name__ == "__main__":
	print("Hello world!")

# main.py
import example
print("I'm not feeling well")
# output
# "I'm not feeling well"
```

---
>[!example] 참고사이트
>- [파이썬(python) - if __name__ == "__main__"을 사용하는 이유](https://tibetsandfox.tistory.com/44)




