"""
Advanced Statistical Analysis Module for Thesis Evaluation

Provides comprehensive statistical metrics including confusion matrices,
ROC curves, AUC scores, and statistical significance testing.
"""

import numpy as np
from typing import Dict, Tuple, List, Optional
from dataclasses import dataclass, field
import json


@dataclass
class ConfusionMatrixMetrics:
    """Container for confusion matrix and derived metrics."""
    
    matrix: np.ndarray
    true_positives: int = 0
    true_negatives: int = 0
    false_positives: int = 0
    false_negatives: int = 0
    sensitivity: float = 0.0  # Recall / True Positive Rate
    specificity: float = 0.0  # True Negative Rate
    precision: float = 0.0
    f1_score: float = 0.0
    mcc: float = 0.0  # Matthews Correlation Coefficient
    accuracy: float = 0.0
    
    def to_dict(self) -> Dict:
        """Convert to dictionary."""
        return {
            'true_positives': int(self.true_positives),
            'true_negatives': int(self.true_negatives),
            'false_positives': int(self.false_positives),
            'false_negatives': int(self.false_negatives),
            'sensitivity': float(self.sensitivity),
            'specificity': float(self.specificity),
            'precision': float(self.precision),
            'f1_score': float(self.f1_score),
            'mcc': float(self.mcc),
            'accuracy': float(self.accuracy),
        }


class StatisticalAnalyzer:
    """Provides advanced statistical analysis for model evaluation."""
    
    @staticmethod
    def compute_confusion_matrix(y_true: np.ndarray, y_pred: np.ndarray) -> np.ndarray:
        """
        Compute confusion matrix for binary classification.
        
        Args:
            y_true: Ground truth labels
            y_pred: Predicted labels
            
        Returns:
            2x2 confusion matrix [[TN, FP], [FN, TP]]
        """
        tp = np.sum((y_pred == 1) & (y_true == 1))
        tn = np.sum((y_pred == 0) & (y_true == 0))
        fp = np.sum((y_pred == 1) & (y_true == 0))
        fn = np.sum((y_pred == 0) & (y_true == 1))
        
        return np.array([[tn, fp], [fn, tp]])
    
    @staticmethod
    def compute_metrics_from_confusion_matrix(cm: np.ndarray) -> ConfusionMatrixMetrics:
        """
        Compute metrics from confusion matrix.
        
        Args:
            cm: Confusion matrix [[TN, FP], [FN, TP]]
            
        Returns:
            ConfusionMatrixMetrics object
        """
        tn, fp, fn, tp = cm[0, 0], cm[0, 1], cm[1, 0], cm[1, 1]
        
        # Basic rates
        sensitivity = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        specificity = tn / (tn + fp) if (tn + fp) > 0 else 0.0
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        f1 = 2 * (precision * sensitivity) / (precision + sensitivity) if (precision + sensitivity) > 0 else 0.0
        accuracy = (tp + tn) / (tp + tn + fp + fn) if (tp + tn + fp + fn) > 0 else 0.0
        
        # Matthews Correlation Coefficient
        denominator = np.sqrt((tp + fp) * (tp + fn) * (tn + fp) * (tn + fn))
        mcc = ((tp * tn) - (fp * fn)) / denominator if denominator > 0 else 0.0
        
        metrics = ConfusionMatrixMetrics(
            matrix=cm,
            true_positives=int(tp),
            true_negatives=int(tn),
            false_positives=int(fp),
            false_negatives=int(fn),
            sensitivity=float(sensitivity),
            specificity=float(specificity),
            precision=float(precision),
            f1_score=float(f1),
            mcc=float(mcc),
            accuracy=float(accuracy),
        )
        return metrics
    
    @staticmethod
    def compute_roc_auc(y_true: np.ndarray, y_scores: np.ndarray) -> Tuple[float, float]:
        """
        Compute ROC AUC score.
        
        Args:
            y_true: Ground truth binary labels
            y_scores: Predicted probability scores
            
        Returns:
            Tuple of (tpr_array, fpr_array, auc_score)
        """
        # Sort by scores descending
        sorted_indices = np.argsort(-y_scores)
        y_sorted = y_true[sorted_indices]
        
        n_pos = np.sum(y_true == 1)
        n_neg = np.sum(y_true == 0)
        
        if n_pos == 0 or n_neg == 0:
            return np.array([0, 1]), np.array([0, 1]), 0.5
        
        # Compute TPR and FPR at different thresholds
        tpr_list = [0]
        fpr_list = [0]
        tp, fp = 0, 0
        
        for i, y in enumerate(y_sorted):
            if y == 1:
                tp += 1
            else:
                fp += 1
            
            tpr_list.append(tp / n_pos)
            fpr_list.append(fp / n_neg)
        
        tpr = np.array(tpr_list)
        fpr = np.array(fpr_list)
        
        # Calculate AUC using trapezoidal rule
        auc = np.trapz(tpr, fpr)
        
        return tpr, fpr, auc
    
    @staticmethod
    def compute_per_class_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[int, Dict[str, float]]:
        """
        Compute per-class precision, recall, f1 for multiclass.
        
        Args:
            y_true: Ground truth labels
            y_pred: Predicted labels
            
        Returns:
            Dictionary with per-class metrics
        """
        unique_classes = np.unique(y_true)
        per_class = {}
        
        for cls in unique_classes:
            tp = np.sum((y_pred == cls) & (y_true == cls))
            fp = np.sum((y_pred == cls) & (y_true != cls))
            fn = np.sum((y_pred != cls) & (y_true == cls))
            
            precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
            recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
            f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
            support = np.sum(y_true == cls)
            
            per_class[int(cls)] = {
                'precision': float(precision),
                'recall': float(recall),
                'f1_score': float(f1),
                'support': int(support),
                'true_positives': int(tp),
            }
        
        return per_class
    
    @staticmethod
    def compute_confidence_interval(scores: np.ndarray, confidence: float = 0.95) -> Tuple[float, float]:
        """
        Compute confidence interval for a metric.
        
        Args:
            scores: Array of metric scores
            confidence: Confidence level (default 0.95 for 95%)
            
        Returns:
            Tuple of (mean, ci_width)
        """
        if len(scores) < 2:
            return float(np.mean(scores)), 0.0
        
        mean = np.mean(scores)
        std = np.std(scores)
        n = len(scores)
        
        # 95% confidence interval using normal distribution
        z_score = 1.96 if confidence == 0.95 else 2.576  # 99%
        margin_of_error = z_score * (std / np.sqrt(n))
        
        return mean, margin_of_error
    
    @staticmethod
    def compute_cross_validation_metrics(folds: List[Dict], metric_name: str = 'f1_score') -> Dict[str, float]:
        """
        Compute cross-validation statistics.
        
        Args:
            folds: List of fold results dictionaries
            metric_name: Metric to analyze
            
        Returns:
            Dictionary with mean, std, min, max of metric
        """
        if not folds:
            return {}
        
        scores = [fold.get(metric_name, 0) for fold in folds]
        scores = np.array(scores)
        
        return {
            'mean': float(np.mean(scores)),
            'std': float(np.std(scores)),
            'min': float(np.min(scores)),
            'max': float(np.max(scores)),
            'folds': int(len(folds)),
        }


class InferenceMetrics:
    """Metrics for inference performance analysis."""
    
    @dataclass
    class InferenceStats:
        """Container for inference statistics."""
        inference_times: List[float] = field(default_factory=list)
        memory_usage_mb: List[float] = field(default_factory=list)
        throughput_images_per_second: float = 0.0
        avg_inference_time_ms: float = 0.0
        std_inference_time_ms: float = 0.0
        min_inference_time_ms: float = 0.0
        max_inference_time_ms: float = 0.0
        
        def to_dict(self) -> Dict:
            """Convert to dictionary."""
            return {
                'avg_inference_time_ms': float(self.avg_inference_time_ms),
                'std_inference_time_ms': float(self.std_inference_time_ms),
                'min_inference_time_ms': float(self.min_inference_time_ms),
                'max_inference_time_ms': float(self.max_inference_time_ms),
                'throughput_images_per_second': float(self.throughput_images_per_second),
                'num_measurements': len(self.inference_times),
            }
    
    @staticmethod
    def compute_inference_stats(inference_times: List[float]) -> 'InferenceMetrics.InferenceStats':
        """
        Compute inference performance statistics.
        
        Args:
            inference_times: List of inference times in seconds
            
        Returns:
            InferenceStats object
        """
        times_ms = np.array(inference_times) * 1000  # Convert to milliseconds
        
        stats = InferenceMetrics.InferenceStats(
            inference_times=inference_times,
            avg_inference_time_ms=float(np.mean(times_ms)),
            std_inference_time_ms=float(np.std(times_ms)),
            min_inference_time_ms=float(np.min(times_ms)),
            max_inference_time_ms=float(np.max(times_ms)),
            throughput_images_per_second=float(1000 / np.mean(times_ms)),
        )
        return stats
