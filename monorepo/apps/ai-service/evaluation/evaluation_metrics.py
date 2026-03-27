"""
Evaluation Metrics Module

This module provides functions to calculate and track various evaluation metrics
for computer vision models including accuracy, precision, recall, and F1 scores.
"""

from typing import Dict, Tuple, List, Optional
from dataclasses import dataclass, field
import numpy as np
from collections import defaultdict


@dataclass
class MetricsResult:
    """Container for evaluation metrics results."""
    
    accuracy: float = 0.0
    precision: float = 0.0
    recall: float = 0.0
    f1_score: float = 0.0
    confusion_matrix: Optional[np.ndarray] = None
    per_class_metrics: Dict[str, Dict[str, float]] = field(default_factory=dict)
    
    def to_dict(self) -> Dict:
        """Convert metrics to dictionary."""
        return {
            'accuracy': float(self.accuracy),
            'precision': float(self.precision),
            'recall': float(self.recall),
            'f1_score': float(self.f1_score),
            'per_class_metrics': self.per_class_metrics,
        }


class EvaluationMetrics:
    """Handles calculation of evaluation metrics."""
    
    @staticmethod
    def calculate_accuracy(y_true: np.ndarray, y_pred: np.ndarray) -> float:
        """
        Calculate classification accuracy.
        
        Args:
            y_true: Ground truth labels
            y_pred: Predicted labels
            
        Returns:
            Accuracy score (0-1)
        """
        if len(y_true) == 0:
            return 0.0
        return float(np.mean(y_true == y_pred))
    
    @staticmethod
    def calculate_precision(y_true: np.ndarray, y_pred: np.ndarray,
                          average: str = 'weighted') -> float:
        """
        Calculate precision score.
        
        Args:
            y_true: Ground truth labels
            y_pred: Predicted labels
            average: Type of averaging ('weighted', 'macro', 'micro')
            
        Returns:
            Precision score
        """
        unique_labels = np.unique(y_true)
        precisions = []
        
        for label in unique_labels:
            tp = np.sum((y_pred == label) & (y_true == label))
            fp = np.sum((y_pred == label) & (y_true != label))
            
            if tp + fp == 0:
                precisions.append(0.0)
            else:
                precisions.append(tp / (tp + fp))
        
        if average == 'macro':
            return float(np.mean(precisions))
        elif average == 'weighted':
            weights = [np.sum(y_true == label) for label in unique_labels]
            return float(np.average(precisions, weights=weights))
        else:
            return float(np.mean(precisions))
    
    @staticmethod
    def calculate_recall(y_true: np.ndarray, y_pred: np.ndarray,
                        average: str = 'weighted') -> float:
        """
        Calculate recall score.
        
        Args:
            y_true: Ground truth labels
            y_pred: Predicted labels
            average: Type of averaging ('weighted', 'macro', 'micro')
            
        Returns:
            Recall score
        """
        unique_labels = np.unique(y_true)
        recalls = []
        
        for label in unique_labels:
            tp = np.sum((y_pred == label) & (y_true == label))
            fn = np.sum((y_pred != label) & (y_true == label))
            
            if tp + fn == 0:
                recalls.append(0.0)
            else:
                recalls.append(tp / (tp + fn))
        
        if average == 'macro':
            return float(np.mean(recalls))
        elif average == 'weighted':
            weights = [np.sum(y_true == label) for label in unique_labels]
            return float(np.average(recalls, weights=weights))
        else:
            return float(np.mean(recalls))
    
    @staticmethod
    def calculate_f1(precision: float, recall: float) -> float:
        """
        Calculate F1 score.
        
        Args:
            precision: Precision score
            recall: Recall score
            
        Returns:
            F1 score
        """
        if precision + recall == 0:
            return 0.0
        return float(2 * (precision * recall) / (precision + recall))
    
    @staticmethod
    def build_confusion_matrix(y_true: np.ndarray, y_pred: np.ndarray) -> np.ndarray:
        """
        Build confusion matrix.
        
        Args:
            y_true: Ground truth labels
            y_pred: Predicted labels
            
        Returns:
            Confusion matrix
        """
        unique_labels = np.unique(np.concatenate([y_true, y_pred]))
        matrix = np.zeros((len(unique_labels), len(unique_labels)))
        
        for i, true_label in enumerate(unique_labels):
            for j, pred_label in enumerate(unique_labels):
                matrix[i, j] = np.sum((y_true == true_label) & (y_pred == pred_label))
        
        return matrix
    
    @staticmethod
    def calculate_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> MetricsResult:
        """
        Calculate all metrics at once.
        
        Args:
            y_true: Ground truth labels
            y_pred: Predicted labels
            
        Returns:
            MetricsResult object containing all metrics
        """
        accuracy = EvaluationMetrics.calculate_accuracy(y_true, y_pred)
        precision = EvaluationMetrics.calculate_precision(y_true, y_pred)
        recall = EvaluationMetrics.calculate_recall(y_true, y_pred)
        f1 = EvaluationMetrics.calculate_f1(precision, recall)
        confusion_matrix = EvaluationMetrics.build_confusion_matrix(y_true, y_pred)
        
        return MetricsResult(
            accuracy=accuracy,
            precision=precision,
            recall=recall,
            f1_score=f1,
            confusion_matrix=confusion_matrix,
        )


def calculate_iou(box1: Tuple[float, float, float, float],
                  box2: Tuple[float, float, float, float]) -> float:
    """
    Calculate Intersection over Union (IoU) for bounding boxes.
    
    Args:
        box1: Bounding box in format (x1, y1, x2, y2)
        box2: Bounding box in format (x1, y1, x2, y2)
        
    Returns:
        IoU score (0-1)
    """
    x1_min, y1_min, x1_max, y1_max = box1
    x2_min, y2_min, x2_max, y2_max = box2
    
    # Calculate intersection area
    inter_x_min = max(x1_min, x2_min)
    inter_y_min = max(y1_min, y2_min)
    inter_x_max = min(x1_max, x2_max)
    inter_y_max = min(y1_max, y2_max)
    
    if inter_x_max < inter_x_min or inter_y_max < inter_y_min:
        return 0.0
    
    inter_area = (inter_x_max - inter_x_min) * (inter_y_max - inter_y_min)
    
    # Calculate union area
    box1_area = (x1_max - x1_min) * (y1_max - y1_min)
    box2_area = (x2_max - x2_min) * (y2_max - y2_min)
    union_area = box1_area + box2_area - inter_area
    
    if union_area == 0:
        return 0.0
    
    return float(inter_area / union_area)
