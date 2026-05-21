import numpy as np
# --- Built-in array creators ---
zeros    = np.zeros((3, 4))          # All zeros
ones     = np.ones((2, 3))           # All ones
full     = np.full((3, 3), 7)        # Fill with a constant
identity = np.eye(4)                 # Identity matrix
empty    = np.empty((2, 2))          # Uninitialized (fast)

print("Zeros:\n", zeros)
print("\nOnes:\n", ones)
print("\nFull (7s):\n", full)
print("\nIdentity (4x4):\n", identity)

# --- Range-based arrays ---
arange   = np.arange(0, 20, 2)          # Like Python range: start, stop, step
linspace = np.linspace(0, 1, 10)        # 10 evenly spaced points between 0 and 1
logspace = np.logspace(0, 3, 4)         # Logarithmically spaced: 10^0 to 10^3

print("arange (0 to 20, step 2):", arange)
print("\nlinspace (0 to 1, 10 points):", linspace)
print("\nlogspace (10^0 to 10^3):", logspace)

a = np.array([1, 2, 3, 4, 5])
b = np.array([10, 20, 30, 40, 50])

print("a         :", a)
print("b         :", b)
print("\na + b     :", a + b)      # Addition
print("a - b     :", a - b)      # Subtraction  
print("a * b     :", a * b)      # Multiplication (element-wise)
print("b / a     :", b / a)      # Division
print("a ** 2    :", a ** 2)     # Power
print("b % 3     :", b % 3)      # Modulo

# Scalar operations
print("\na * 10    :", a * 10)   # Multiply by scalar
print("a + 100   :", a + 100)   # Add scalar