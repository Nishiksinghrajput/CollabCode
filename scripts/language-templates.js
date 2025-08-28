// Enhanced Language Templates with Common Interview Patterns
const LanguageTemplates = {
  // Programming Languages with Algorithm Templates
  javascript: {
    mode: 'ace/mode/javascript',
    ext: 'js',
    name: 'JavaScript',
    icon: '🟨',
    templates: {
      default: `// JavaScript - Ready to Run
// Run this code directly with Node.js or in browser console

function solution(nums) {
    // Your solution here
    let result = 0;
    
    for (let num of nums) {
        result += num;
    }
    
    return result;
}

// Main function to run tests
function main() {
    // Test Case 1
    const test1 = [1, 2, 3, 4, 5];
    console.log("Input:", test1);
    console.log("Output:", solution(test1));
    console.log("Expected: 15\\n");
    
    // Test Case 2
    const test2 = [10, -5, 7];
    console.log("Input:", test2);
    console.log("Output:", solution(test2));
    console.log("Expected: 12\\n");
    
    // Test Case 3
    const test3 = [];
    console.log("Input:", test3);
    console.log("Output:", solution(test3));
    console.log("Expected: 0\\n");
    
    // Add your test cases here
    // const test4 = [your_input];
    // console.log("Output:", solution(test4));
}

// Run the main function
main();`,

      twoPointer: `// Two Pointer Pattern
function twoSum(nums, target) {
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    
    return [];
}`,

      slidingWindow: `// Sliding Window Pattern
function maxSubarraySum(arr, k) {
    if (arr.length < k) return null;
    
    let maxSum = 0;
    let windowSum = 0;
    
    // Calculate initial window
    for (let i = 0; i < k; i++) {
        windowSum += arr[i];
    }
    maxSum = windowSum;
    
    // Slide the window
    for (let i = k; i < arr.length; i++) {
        windowSum = windowSum - arr[i - k] + arr[i];
        maxSum = Math.max(maxSum, windowSum);
    }
    
    return maxSum;
}`,

      binarySearch: `// Binary Search Template
function binarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        if (arr[mid] === target) {
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return -1;
}`
    }
  },

  python: {
    mode: 'ace/mode/python',
    ext: 'py',
    name: 'Python',
    icon: '🐍',
    templates: {
      default: `# Python - Ready to Run
# Execute this code directly with: python3 filename.py

def solution(nums):
    """
    Solve the problem here.
    
    Args:
        nums: List of integers
    
    Returns:
        int: The result
    """
    # Your solution here
    result = 0
    
    for num in nums:
        result += num
    
    return result


def main():
    """Main function to run test cases"""
    
    # Test Case 1
    test1 = [1, 2, 3, 4, 5]
    print(f"Input: {test1}")
    print(f"Output: {solution(test1)}")
    print(f"Expected: 15\\n")
    
    # Test Case 2
    test2 = [10, -5, 7]
    print(f"Input: {test2}")
    print(f"Output: {solution(test2)}")
    print(f"Expected: 12\\n")
    
    # Test Case 3
    test3 = []
    print(f"Input: {test3}")
    print(f"Output: {solution(test3)}")
    print(f"Expected: 0\\n")
    
    # Test Case 4 - Edge case
    test4 = [-1, -2, -3]
    print(f"Input: {test4}")
    print(f"Output: {solution(test4)}")
    print(f"Expected: -6\\n")
    
    # Add your custom test cases here
    # custom_test = [your_input]
    # print(f"Output: {solution(custom_test)}")


if __name__ == "__main__":
    main()`,

      graph: `# Graph Traversal Template
from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque([start])
    visited.add(start)
    result = []
    
    while queue:
        node = queue.popleft()
        result.append(node)
        
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    
    return result

def dfs(graph, start):
    visited = set()
    result = []
    
    def dfs_helper(node):
        visited.add(node)
        result.append(node)
        
        for neighbor in graph[node]:
            if neighbor not in visited:
                dfs_helper(neighbor)
    
    dfs_helper(start)
    return result`,

      dynamicProgramming: `# Dynamic Programming Template
def fibonacci(n):
    # Memoization approach
    memo = {}
    
    def fib(n):
        if n in memo:
            return memo[n]
        if n <= 1:
            return n
        
        memo[n] = fib(n-1) + fib(n-2)
        return memo[n]
    
    return fib(n)

# Tabulation approach
def fibonacci_tab(n):
    if n <= 1:
        return n
    
    dp = [0] * (n + 1)
    dp[0] = 0
    dp[1] = 1
    
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    
    return dp[n]`
    }
  },

  java: {
    mode: 'ace/mode/java',
    ext: 'java',
    name: 'Java',
    icon: '☕',
    templates: {
      default: `// Java - Ready to Run
// Compile: javac Solution.java
// Run: java Solution

import java.util.*;
import java.io.*;

public class Solution {
    
    public static int solution(int[] nums) {
        // Your solution here
        int result = 0;
        
        for (int num : nums) {
            result += num;
        }
        
        return result;
    }
    
    public static void main(String[] args) {
        System.out.println("=== Running Test Cases ===\\n");
        
        // Test Case 1
        int[] test1 = {1, 2, 3, 4, 5};
        System.out.println("Test Case 1:");
        System.out.println("Input: " + Arrays.toString(test1));
        System.out.println("Output: " + solution(test1));
        System.out.println("Expected: 15\\n");
        
        // Test Case 2
        int[] test2 = {10, -5, 7};
        System.out.println("Test Case 2:");
        System.out.println("Input: " + Arrays.toString(test2));
        System.out.println("Output: " + solution(test2));
        System.out.println("Expected: 12\\n");
        
        // Test Case 3
        int[] test3 = {};
        System.out.println("Test Case 3:");
        System.out.println("Input: " + Arrays.toString(test3));
        System.out.println("Output: " + solution(test3));
        System.out.println("Expected: 0\\n");
        
        // Test Case 4 - Edge case
        int[] test4 = {-1, -2, -3};
        System.out.println("Test Case 4:");
        System.out.println("Input: " + Arrays.toString(test4));
        System.out.println("Output: " + solution(test4));
        System.out.println("Expected: -6\\n");
        
        // Performance Test
        int[] largeTest = new int[1000000];
        Arrays.fill(largeTest, 1);
        long startTime = System.currentTimeMillis();
        int largeResult = solution(largeTest);
        long endTime = System.currentTimeMillis();
        System.out.println("Performance Test (1M elements):");
        System.out.println("Result: " + largeResult);
        System.out.println("Time taken: " + (endTime - startTime) + " ms");
    }
}`,

      linkedList: `// Linked List Template
class ListNode {
    int val;
    ListNode next;
    
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { 
        this.val = val; 
        this.next = next; 
    }
}

public class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;
        ListNode current = head;
        
        while (current != null) {
            ListNode nextTemp = current.next;
            current.next = prev;
            prev = current;
            current = nextTemp;
        }
        
        return prev;
    }
}`
    }
  },

  c_cpp: {
    mode: 'ace/mode/c_cpp',
    ext: 'cpp',
    name: 'C++',
    icon: '🔷',
    templates: {
      default: `// C++ - Ready to Run
// Compile: g++ -std=c++17 solution.cpp -o solution
// Run: ./solution

#include <iostream>
#include <vector>
#include <algorithm>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <queue>
#include <stack>
#include <climits>
#include <chrono>

using namespace std;

class Solution {
public:
    int solve(vector<int>& nums) {
        // Your solution here
        int result = 0;
        
        for (int num : nums) {
            result += num;
        }
        
        return result;
    }
};

void printVector(const vector<int>& vec) {
    cout << "[";
    for (int i = 0; i < vec.size(); i++) {
        cout << vec[i];
        if (i < vec.size() - 1) cout << ", ";
    }
    cout << "]";
}

int main() {
    Solution solution;
    
    cout << "=== Running Test Cases ===\n" << endl;
    
    // Test Case 1
    vector<int> test1 = {1, 2, 3, 4, 5};
    cout << "Test Case 1:" << endl;
    cout << "Input: "; printVector(test1); cout << endl;
    cout << "Output: " << solution.solve(test1) << endl;
    cout << "Expected: 15\n" << endl;
    
    // Test Case 2
    vector<int> test2 = {10, -5, 7};
    cout << "Test Case 2:" << endl;
    cout << "Input: "; printVector(test2); cout << endl;
    cout << "Output: " << solution.solve(test2) << endl;
    cout << "Expected: 12\n" << endl;
    
    // Test Case 3
    vector<int> test3 = {};
    cout << "Test Case 3:" << endl;
    cout << "Input: "; printVector(test3); cout << endl;
    cout << "Output: " << solution.solve(test3) << endl;
    cout << "Expected: 0\n" << endl;
    
    // Test Case 4 - Edge case
    vector<int> test4 = {-1, -2, -3};
    cout << "Test Case 4:" << endl;
    cout << "Input: "; printVector(test4); cout << endl;
    cout << "Output: " << solution.solve(test4) << endl;
    cout << "Expected: -6\n" << endl;
    
    // Performance Test
    vector<int> largeTest(1000000, 1);
    auto start = chrono::high_resolution_clock::now();
    int largeResult = solution.solve(largeTest);
    auto end = chrono::high_resolution_clock::now();
    auto duration = chrono::duration_cast<chrono::milliseconds>(end - start);
    cout << "Performance Test (1M elements):" << endl;
    cout << "Result: " << largeResult << endl;
    cout << "Time taken: " << duration.count() << " ms" << endl;
    
    return 0;
}`,

      binaryTree: `// Binary Tree Template
struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int x) : val(x), left(NULL), right(NULL) {}
};

class Solution {
public:
    int maxDepth(TreeNode* root) {
        if (!root) return 0;
        
        int leftDepth = maxDepth(root->left);
        int rightDepth = maxDepth(root->right);
        
        return max(leftDepth, rightDepth) + 1;
    }
    
    vector<int> inorderTraversal(TreeNode* root) {
        vector<int> result;
        inorder(root, result);
        return result;
    }
    
private:
    void inorder(TreeNode* node, vector<int>& result) {
        if (!node) return;
        
        inorder(node->left, result);
        result.push_back(node->val);
        inorder(node->right, result);
    }
};`
    }
  },

  csharp: {
    mode: 'ace/mode/csharp',
    ext: 'cs',
    name: 'C#',
    icon: '🟦',
    templates: {
      default: `// C# - Ready to Run
// Compile: csc Solution.cs
// Run: ./Solution.exe (Windows) or mono Solution.exe (Mac/Linux)

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Diagnostics;

public class Solution 
{
    public int Solve(int[] nums) 
    {
        // Your solution here
        int result = 0;
        
        foreach (int num in nums) 
        {
            result += num;
        }
        
        return result;
    }
    
    public static void Main() 
    {
        Solution solution = new Solution();
        Console.WriteLine("=== Running Test Cases ===\n");
        
        // Test Case 1
        int[] test1 = {1, 2, 3, 4, 5};
        Console.WriteLine("Test Case 1:");
        Console.WriteLine($"Input: [{string.Join(", ", test1)}]");
        Console.WriteLine($"Output: {solution.Solve(test1)}");
        Console.WriteLine("Expected: 15\n");
        
        // Test Case 2
        int[] test2 = {10, -5, 7};
        Console.WriteLine("Test Case 2:");
        Console.WriteLine($"Input: [{string.Join(", ", test2)}]");
        Console.WriteLine($"Output: {solution.Solve(test2)}");
        Console.WriteLine("Expected: 12\n");
        
        // Test Case 3
        int[] test3 = {};
        Console.WriteLine("Test Case 3:");
        Console.WriteLine($"Input: [{string.Join(", ", test3)}]");
        Console.WriteLine($"Output: {solution.Solve(test3)}");
        Console.WriteLine("Expected: 0\n");
        
        // Test Case 4 - Edge case
        int[] test4 = {-1, -2, -3};
        Console.WriteLine("Test Case 4:");
        Console.WriteLine($"Input: [{string.Join(", ", test4)}]");
        Console.WriteLine($"Output: {solution.Solve(test4)}");
        Console.WriteLine("Expected: -6\n");
        
        // Performance Test
        int[] largeTest = new int[1000000];
        Array.Fill(largeTest, 1);
        Stopwatch sw = Stopwatch.StartNew();
        int largeResult = solution.Solve(largeTest);
        sw.Stop();
        Console.WriteLine("Performance Test (1M elements):");
        Console.WriteLine($"Result: {largeResult}");
        Console.WriteLine($"Time taken: {sw.ElapsedMilliseconds} ms");
    }
}`
    }
  },

  go: {
    mode: 'ace/mode/golang',
    ext: 'go',
    name: 'Go',
    icon: '🐹',
    templates: {
      default: `// Go - Ready to Run
// Run: go run solution.go

package main

import (
    "fmt"
    "time"
)

func solution(nums []int) int {
    // Your solution here
    result := 0
    
    for _, num := range nums {
        result += num
    }
    
    return result
}

func main() {
    fmt.Println("=== Running Test Cases ===\n")
    
    // Test Case 1
    test1 := []int{1, 2, 3, 4, 5}
    fmt.Println("Test Case 1:")
    fmt.Printf("Input: %v\n", test1)
    fmt.Printf("Output: %d\n", solution(test1))
    fmt.Println("Expected: 15\n")
    
    // Test Case 2
    test2 := []int{10, -5, 7}
    fmt.Println("Test Case 2:")
    fmt.Printf("Input: %v\n", test2)
    fmt.Printf("Output: %d\n", solution(test2))
    fmt.Println("Expected: 12\n")
    
    // Test Case 3
    test3 := []int{}
    fmt.Println("Test Case 3:")
    fmt.Printf("Input: %v\n", test3)
    fmt.Printf("Output: %d\n", solution(test3))
    fmt.Println("Expected: 0\n")
    
    // Test Case 4 - Edge case
    test4 := []int{-1, -2, -3}
    fmt.Println("Test Case 4:")
    fmt.Printf("Input: %v\n", test4)
    fmt.Printf("Output: %d\n", solution(test4))
    fmt.Println("Expected: -6\n")
    
    // Performance Test
    largeTest := make([]int, 1000000)
    for i := range largeTest {
        largeTest[i] = 1
    }
    start := time.Now()
    largeResult := solution(largeTest)
    duration := time.Since(start)
    fmt.Println("Performance Test (1M elements):")
    fmt.Printf("Result: %d\n", largeResult)
    fmt.Printf("Time taken: %v\n", duration)
}`
    }
  },

  rust: {
    mode: 'ace/mode/rust',
    ext: 'rs',
    name: 'Rust',
    icon: '🦀',
    templates: {
      default: `// Rust - Ready to Run
// Compile: rustc solution.rs
// Run: ./solution
// Or directly: cargo run (if using Cargo)

use std::time::Instant;

fn solution(nums: Vec<i32>) -> i32 {
    // Your solution here
    let mut result = 0;
    
    for num in nums {
        result += num;
    }
    
    result
}

fn main() {
    println!("=== Running Test Cases ===\n");
    
    // Test Case 1
    let test1 = vec![1, 2, 3, 4, 5];
    println!("Test Case 1:");
    println!("Input: {:?}", test1);
    println!("Output: {}", solution(test1.clone()));
    println!("Expected: 15\n");
    
    // Test Case 2
    let test2 = vec![10, -5, 7];
    println!("Test Case 2:");
    println!("Input: {:?}", test2);
    println!("Output: {}", solution(test2.clone()));
    println!("Expected: 12\n");
    
    // Test Case 3
    let test3: Vec<i32> = vec![];
    println!("Test Case 3:");
    println!("Input: {:?}", test3);
    println!("Output: {}", solution(test3.clone()));
    println!("Expected: 0\n");
    
    // Test Case 4 - Edge case
    let test4 = vec![-1, -2, -3];
    println!("Test Case 4:");
    println!("Input: {:?}", test4);
    println!("Output: {}", solution(test4.clone()));
    println!("Expected: -6\n");
    
    // Performance Test
    let large_test: Vec<i32> = vec![1; 1000000];
    let start = Instant::now();
    let large_result = solution(large_test);
    let duration = start.elapsed();
    println!("Performance Test (1M elements):");
    println!("Result: {}", large_result);
    println!("Time taken: {:?}", duration);
}`
    }
  },

  typescript: {
    mode: 'ace/mode/typescript',
    ext: 'ts',
    name: 'TypeScript',
    icon: '🔵',
    templates: {
      default: `// TypeScript - Ready to Run
// Compile: tsc solution.ts
// Run: node solution.js
// Or directly: npx ts-node solution.ts

function solution(nums: number[]): number {
    // Your solution here
    let result: number = 0;
    
    for (const num of nums) {
        result += num;
    }
    
    return result;
}

// Type definitions
interface TestCase {
    input: number[];
    expected: number;
    description: string;
}

function runTests(): void {
    console.log("=== Running Test Cases ===\n");
    
    const testCases: TestCase[] = [
        { input: [1, 2, 3, 4, 5], expected: 15, description: "Test Case 1: Basic sum" },
        { input: [10, -5, 7], expected: 12, description: "Test Case 2: Mixed positive/negative" },
        { input: [], expected: 0, description: "Test Case 3: Empty array" },
        { input: [-1, -2, -3], expected: -6, description: "Test Case 4: All negative" },
    ];
    
    testCases.forEach((test, index) => {
        console.log(test.description);
        console.log(`Input: [${test.input.join(", ")}]`);
        const output = solution(test.input);
        console.log(`Output: ${output}`);
        console.log(`Expected: ${test.expected}`);
        console.log(`Result: ${output === test.expected ? "✅ PASS" : "❌ FAIL"}\n`);
    });
    
    // Performance Test
    const largeTest: number[] = new Array(1000000).fill(1);
    const start = Date.now();
    const largeResult = solution(largeTest);
    const end = Date.now();
    console.log("Performance Test (1M elements):");
    console.log(`Result: ${largeResult}`);
    console.log(`Time taken: ${end - start} ms`);
}

// Run the tests
runTests();`
    }
  },

  swift: {
    mode: 'ace/mode/swift',
    ext: 'swift',
    name: 'Swift',
    icon: '🍎',
    templates: {
      default: `// Swift - Ready to Run
// Compile: swiftc solution.swift
// Run: ./solution
// Or directly: swift solution.swift

import Foundation

func solution(_ nums: [Int]) -> Int {
    // Your solution here
    var result = 0
    
    for num in nums {
        result += num
    }
    
    return result
}

func runTests() {
    print("=== Running Test Cases ===\n")
    
    // Test Case 1
    let test1 = [1, 2, 3, 4, 5]
    print("Test Case 1:")
    print("Input: \(test1)")
    print("Output: \(solution(test1))")
    print("Expected: 15\n")
    
    // Test Case 2
    let test2 = [10, -5, 7]
    print("Test Case 2:")
    print("Input: \(test2)")
    print("Output: \(solution(test2))")
    print("Expected: 12\n")
    
    // Test Case 3
    let test3: [Int] = []
    print("Test Case 3:")
    print("Input: \(test3)")
    print("Output: \(solution(test3))")
    print("Expected: 0\n")
    
    // Test Case 4 - Edge case
    let test4 = [-1, -2, -3]
    print("Test Case 4:")
    print("Input: \(test4)")
    print("Output: \(solution(test4))")
    print("Expected: -6\n")
    
    // Performance Test
    let largeTest = Array(repeating: 1, count: 1000000)
    let start = Date()
    let largeResult = solution(largeTest)
    let end = Date()
    let timeInterval = end.timeIntervalSince(start)
    print("Performance Test (1M elements):")
    print("Result: \(largeResult)")
    print("Time taken: \(Int(timeInterval * 1000)) ms")
}

// Run the tests
runTests()`
    }
  },

  kotlin: {
    mode: 'ace/mode/kotlin',
    ext: 'kt',
    name: 'Kotlin',
    icon: '🟪',
    templates: {
      default: `// Kotlin - Interview Template

// Time Complexity: O()
// Space Complexity: O()

fun solution(nums: IntArray): Int {
    // Your code here
    
    return 0
}

fun main() {
    // Test cases
    println(solution(intArrayOf(1, 2, 3, 4, 5)))  // Expected: ?
    println(solution(intArrayOf()))               // Expected: ?
}`
    }
  },

  ruby: {
    mode: 'ace/mode/ruby',
    ext: 'rb',
    name: 'Ruby',
    icon: '💎',
    templates: {
      default: `# Ruby - Ready to Run
# Run: ruby solution.rb

def solution(nums)
  # Your solution here
  result = 0
  
  nums.each do |num|
    result += num
  end
  
  result
end

def run_tests
  puts "=== Running Test Cases ===\n"
  
  # Test Case 1
  test1 = [1, 2, 3, 4, 5]
  puts "Test Case 1:"
  puts "Input: #{test1.inspect}"
  puts "Output: #{solution(test1)}"
  puts "Expected: 15\n"
  
  # Test Case 2
  test2 = [10, -5, 7]
  puts "Test Case 2:"
  puts "Input: #{test2.inspect}"
  puts "Output: #{solution(test2)}"
  puts "Expected: 12\n"
  
  # Test Case 3
  test3 = []
  puts "Test Case 3:"
  puts "Input: #{test3.inspect}"
  puts "Output: #{solution(test3)}"
  puts "Expected: 0\n"
  
  # Test Case 4 - Edge case
  test4 = [-1, -2, -3]
  puts "Test Case 4:"
  puts "Input: #{test4.inspect}"
  puts "Output: #{solution(test4)}"
  puts "Expected: -6\n"
  
  # Performance Test
  large_test = Array.new(1000000, 1)
  start_time = Time.now
  large_result = solution(large_test)
  end_time = Time.now
  puts "Performance Test (1M elements):"
  puts "Result: #{large_result}"
  puts "Time taken: #{((end_time - start_time) * 1000).round(2)} ms"
end

# Run the tests
run_tests`
    }
  },

  php: {
    mode: 'ace/mode/php',
    ext: 'php',
    name: 'PHP',
    icon: '🐘',
    templates: {
      default: `<?php
// PHP - Interview Template
// Time Complexity: O()
// Space Complexity: O()

function solution($input) {
    // Your code here
    
    return 0;
}

// Test cases
echo solution([1, 2, 3, 4, 5]) . PHP_EOL;  // Expected: ?
echo solution([]) . PHP_EOL;               // Expected: ?
?>`
    }
  },

  scala: {
    mode: 'ace/mode/scala',
    ext: 'scala',
    name: 'Scala',
    icon: '🔴',
    templates: {
      default: `// Scala - Interview Template

object Solution {
  // Time Complexity: O()
  // Space Complexity: O()
  
  def solution(nums: Array[Int]): Int = {
    // Your code here
    
    0
  }
  
  def main(args: Array[String]): Unit = {
    // Test cases
    println(solution(Array(1, 2, 3, 4, 5)))  // Expected: ?
    println(solution(Array()))               // Expected: ?
  }
}`
    }
  },

  r: {
    mode: 'ace/mode/r',
    ext: 'r',
    name: 'R',
    icon: '📊',
    templates: {
      default: `# R - Statistical Computing Template

# Time Complexity: O()
# Space Complexity: O()

solution <- function(input) {
  # Your code here
  
  return(0)
}

# Test cases
print(solution(c(1, 2, 3, 4, 5)))  # Expected: ?
print(solution(c()))               # Expected: ?`
    }
  },

  perl: {
    mode: 'ace/mode/perl',
    ext: 'pl',
    name: 'Perl',
    icon: '🐪',
    templates: {
      default: `#!/usr/bin/perl
# Perl - Interview Template

use strict;
use warnings;

# Time Complexity: O()
# Space Complexity: O()

sub solution {
    my @input = @_;
    # Your code here
    
    return 0;
}

# Test cases
print solution(1, 2, 3, 4, 5) . "\\n";  # Expected: ?
print solution() . "\\n";               # Expected: ?`
    }
  },

  lua: {
    mode: 'ace/mode/lua',
    ext: 'lua',
    name: 'Lua',
    icon: '🌙',
    templates: {
      default: `-- Lua - Interview Template
-- Time Complexity: O()
-- Space Complexity: O()

function solution(input)
    -- Your code here
    
    return 0
end

-- Test cases
print(solution({1, 2, 3, 4, 5}))  -- Expected: ?
print(solution({}))               -- Expected: ?`
    }
  },

  haskell: {
    mode: 'ace/mode/haskell',
    ext: 'hs',
    name: 'Haskell',
    icon: '🎓',
    templates: {
      default: `-- Haskell - Interview Template
-- Time Complexity: O()
-- Space Complexity: O()

solution :: [Int] -> Int
solution xs = 
    -- Your code here
    0

main :: IO ()
main = do
    -- Test cases
    print $ solution [1, 2, 3, 4, 5]  -- Expected: ?
    print $ solution []               -- Expected: ?`
    }
  },

  elixir: {
    mode: 'ace/mode/elixir',
    ext: 'ex',
    name: 'Elixir',
    icon: '💧',
    templates: {
      default: `# Elixir - Interview Template

defmodule Solution do
  # Time Complexity: O()
  # Space Complexity: O()
  
  def solve(input) do
    # Your code here
    
    0
  end
end

# Test cases
IO.inspect Solution.solve([1, 2, 3, 4, 5])  # Expected: ?
IO.inspect Solution.solve([])               # Expected: ?`
    }
  },

  dart: {
    mode: 'ace/mode/dart',
    ext: 'dart',
    name: 'Dart',
    icon: '🎯',
    templates: {
      default: `// Dart - Interview Template

// Time Complexity: O()
// Space Complexity: O()

int solution(List<int> input) {
  // Your code here
  
  return 0;
}

void main() {
  // Test cases
  print(solution([1, 2, 3, 4, 5]));  // Expected: ?
  print(solution([]));               // Expected: ?
}`
    }
  },

  // Web Technologies
  html: {
    mode: 'ace/mode/html',
    ext: 'html',
    name: 'HTML',
    icon: '🌐',
    templates: {
      default: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interview Project</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            margin: 0 0 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to the Interview!</h1>
        <p>Build something amazing here.</p>
        
        <!-- Your code here -->
        
    </div>
    
    <script>
        // JavaScript code here
        console.log('Ready to code!');
    </script>
</body>
</html>`
    }
  },

  css: {
    mode: 'ace/mode/css',
    ext: 'css',
    name: 'CSS',
    icon: '🎨',
    templates: {
      default: `/* CSS - Modern Styling Template */

:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --text-color: #333;
    --bg-color: #f7f7f7;
    --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: var(--text-color);
    background: var(--bg-color);
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

/* Flexbox Layout */
.flex-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
}

/* Grid Layout */
.grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
}

/* Card Component */
.card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: var(--shadow);
    transition: transform 0.3s ease;
}

.card:hover {
    transform: translateY(-5px);
}

/* Button Styles */
.btn {
    display: inline-block;
    padding: 12px 24px;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: white;
    text-decoration: none;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    transition: opacity 0.3s ease;
}

.btn:hover {
    opacity: 0.9;
}

/* Responsive Design */
@media (max-width: 768px) {
    .flex-container {
        flex-direction: column;
    }
    
    .container {
        padding: 10px;
    }
}`
    }
  },

  sql: {
    mode: 'ace/mode/sql',
    ext: 'sql',
    name: 'SQL',
    icon: '🗄️',
    templates: {
      default: `-- SQL - Database Query Template

-- Create tables
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert sample data
INSERT INTO users (username, email) VALUES 
    ('john_doe', 'john@example.com'),
    ('jane_smith', 'jane@example.com');

-- Common query patterns

-- Join query
SELECT u.username, p.title, p.created_at
FROM users u
JOIN posts p ON u.id = p.user_id
WHERE u.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY p.created_at DESC;

-- Aggregation query
SELECT u.username, COUNT(p.id) as post_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
GROUP BY u.id
HAVING post_count > 5;

-- Window function example
SELECT 
    username,
    created_at,
    ROW_NUMBER() OVER (ORDER BY created_at) as user_number,
    DENSE_RANK() OVER (ORDER BY DATE(created_at)) as registration_day_rank
FROM users;`
    }
  },

  markdown: {
    mode: 'ace/mode/markdown',
    ext: 'md',
    name: 'Markdown',
    icon: '📝',
    templates: {
      default: `# Project Title

## Problem Statement
Describe the problem you're solving here.

## Approach
Explain your approach to solving the problem.

### Time Complexity
- **Best Case:** O(?)
- **Average Case:** O(?)
- **Worst Case:** O(?)

### Space Complexity
O(?)

## Solution

\`\`\`javascript
// Your code here
function solution(input) {
    return result;
}
\`\`\`

## Test Cases

| Input | Expected Output | Explanation |
|-------|----------------|-------------|
| [1,2,3] | 6 | Sum of all elements |
| [] | 0 | Empty array returns 0 |

## Edge Cases
- Empty input
- Single element
- Negative numbers
- Maximum integer values

## Follow-up Questions
1. How would you optimize this for larger inputs?
2. What if we had memory constraints?
3. How would you handle concurrent access?`
    }
  },

  json: {
    mode: 'ace/mode/json',
    ext: 'json',
    name: 'JSON',
    icon: '📋',
    templates: {
      default: `{
  "name": "Interview Project",
  "version": "1.0.0",
  "description": "A sample JSON structure for technical interviews",
  "author": {
    "name": "Your Name",
    "email": "email@example.com",
    "role": "Software Engineer"
  },
  "config": {
    "environment": "development",
    "debug": true,
    "features": {
      "authentication": true,
      "realtime": true,
      "notifications": false
    },
    "database": {
      "type": "postgresql",
      "host": "localhost",
      "port": 5432,
      "name": "interview_db"
    }
  },
  "api_endpoints": [
    {
      "method": "GET",
      "path": "/api/users",
      "description": "Get all users"
    },
    {
      "method": "POST",
      "path": "/api/users",
      "description": "Create a new user"
    }
  ],
  "sample_data": [
    {
      "id": 1,
      "name": "Alice",
      "skills": ["JavaScript", "Python", "SQL"]
    },
    {
      "id": 2,
      "name": "Bob",
      "skills": ["Java", "Spring", "Docker"]
    }
  ]
}`
    }
  },

  yaml: {
    mode: 'ace/mode/yaml',
    ext: 'yaml',
    name: 'YAML',
    icon: '📄',
    templates: {
      default: `# YAML Configuration Template
name: Interview Project
version: 1.0.0

# Application Configuration
app:
  name: MyApp
  environment: development
  debug: true
  port: 3000
  
# Database Configuration  
database:
  type: postgresql
  host: localhost
  port: 5432
  name: interview_db
  credentials:
    username: admin
    password: secure_password
    
# Services Configuration
services:
  - name: api
    port: 8080
    replicas: 3
    resources:
      memory: 512Mi
      cpu: 250m
      
  - name: worker
    port: 8081
    replicas: 2
    resources:
      memory: 256Mi
      cpu: 100m
      
# Feature Flags
features:
  authentication: true
  real_time_sync: true
  notifications: false
  analytics: true`
    }
  },

  xml: {
    mode: 'ace/mode/xml',
    ext: 'xml',
    name: 'XML',
    icon: '📰',
    templates: {
      default: `<?xml version="1.0" encoding="UTF-8"?>
<!-- XML Data Structure Template -->
<application>
    <metadata>
        <name>Interview Application</name>
        <version>1.0.0</version>
        <author>Your Name</author>
        <created>2024-01-01</created>
    </metadata>
    
    <configuration>
        <database>
            <type>PostgreSQL</type>
            <host>localhost</host>
            <port>5432</port>
            <name>interview_db</name>
        </database>
        
        <features>
            <feature enabled="true">authentication</feature>
            <feature enabled="true">realtime</feature>
            <feature enabled="false">notifications</feature>
        </features>
    </configuration>
    
    <users>
        <user id="1">
            <name>Alice Johnson</name>
            <email>alice@example.com</email>
            <role>admin</role>
        </user>
        <user id="2">
            <name>Bob Smith</name>
            <email>bob@example.com</email>
            <role>developer</role>
        </user>
    </users>
</application>`
    }
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LanguageTemplates;
}